import Query from "../src/query-builder";

describe('INSERT Query', () => {

    test('Basic INSERT with EXPLAIN', () => {
        const {sql, values} = new Query({
            explain: true,
            insert: 'employees',
            values: ['John Doe', 30, 'IT', 50000],
        });

        expect(sql).toEqual('EXPLAIN INSERT INTO employees VALUES (?, ?, ?, ?);');
        expect(values).toEqual(['John Doe', 30, 'IT', 50000]);
    });

    test('Basic INSERT with explicit column names', () => {
        const {sql, values} = new Query({
            insert: {
                table: 'employees',
                columns: ['name', 'age', 'department', 'salary']
            },
            values: ['John Doe', 30, 'IT', 50000],
        });

        expect(sql).toEqual('INSERT INTO employees (name, age, department, salary) VALUES (?, ?, ?, ?);');
        expect(values).toEqual(['John Doe', 30, 'IT', 50000]);
    });

    test('Basic INSERT without explicit column names', () => {
        const {sql, values} = new Query({
            insert: 'employees',
            values: ['John Doe', 30, 'IT', 50000],
        });

        expect(sql).toEqual('INSERT INTO employees VALUES (?, ?, ?, ?);');
        expect(values).toEqual(['John Doe', 30, 'IT', 50000]);
    });

    test('INSERT using a subquery', () => {
        const {sql, values} = new Query({
            insert: {
                table: 'employees',
                columns: ['name', 'age', 'department', 'salary']
            },
            select: new Query({
                select: ['full_name', 'age', 'department', 'monthly_salary'],
                from: 'applicants',
                where: {
                    conditions: {
                        interview_passed: null
                    }
                }
            })
        });

        expect(sql).toEqual('INSERT INTO employees (name, age, department, salary) SELECT full_name, age, department, monthly_salary FROM applicants WHERE interview_passed IS NULL;');
        expect(values).toEqual([]);
    });

    test('INSERT using multiple subqueries', () => {
        const {sql, values} = new Query({
            insert: {
                table: 'destination_table',
                columns: ['id', 'name', 'role']
            },
            select: [
                new Query({
                    select: ['id', 'name', 'role'],
                    from: 'source_table1',
                }),
                new Query({
                    select: ['id', 'name', 'role'],
                    from: 'source_table2',
                }),
            ]
        });

        expect(sql).toEqual('INSERT INTO destination_table (id, name, role) SELECT id, name, role FROM source_table1 UNION SELECT id, name, role FROM source_table2;');
        expect(values).toEqual([]);
    });

    test('Basic INSERT with IGNORE', () => {
        const {sql, values} = new Query({
            insert: 'employees',
            ignore: true,
            values: ['John Doe', 30, 'IT', 50000],
        });

        expect(sql).toEqual('INSERT IGNORE INTO employees VALUES (?, ?, ?, ?);');
        expect(values).toEqual(['John Doe', 30, 'IT', 50000]);
    });

    test('Basic INSERT with two dimensional array, aka multiple INSERT', () => {
        const {sql, values} = new Query({
            insert: 'employees',
            values: [['John Doe', 30, 'IT', 50000], ['Bill Gates', 1000, 'IT', 1000000]],
        });

        expect(sql).toEqual('INSERT INTO employees VALUES (?, ?, ?, ?), (?, ?, ?, ?);');
        expect(values).toEqual(['John Doe', 30, 'IT', 50000, 'Bill Gates', 1000, 'IT', 1000000]);
    });

    test('Basic INSERT with SET', () => {
        const {sql, values} = new Query({
            insert: 'employees',
            set: {
                name: 'John Doe',
                salary: 50000
            }
        });

        expect(sql).toEqual('INSERT INTO employees SET name = ?, salary = ?;');
        expect(values).toEqual(['John Doe', 50000]);
    });
});
