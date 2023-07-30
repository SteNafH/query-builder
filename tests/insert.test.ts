import Query from "../src/query-builder";

describe('INSERT Query', () => {

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
                        interview_passed: 1
                    }
                }
            })
        });

        expect(sql).toEqual('INSERT INTO employees (name, age, department, salary) SELECT full_name, age, department, monthly_salary FROM applicants WHERE interview_passed = ?;');
        expect(values).toEqual([1]);
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
