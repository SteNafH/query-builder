import Query from "../src/query-builder";

describe('SELECT Query', () => {
    test('Basic SELECT with EXPLAIN', () => {
        const {sql, values} = new Query({
            explain: true,
            select: '*',
            from: 'table_name',
        });

        expect(sql).toEqual('EXPLAIN SELECT * FROM table_name;');
        expect(values).toEqual([]);
    });

    test('Basic SELECT', () => {
        const {sql, values} = new Query({
            select: '*',
            from: 'table_name',
        });

        expect(sql).toEqual('SELECT * FROM table_name;');
        expect(values).toEqual([]);
    });

    test('Basic SELECT with DISTINCT', () => {
        const {sql, values} = new Query({
            select: '*',
            distinct: true,
            from: 'table_name',
        });

        expect(sql).toEqual('SELECT DISTINCT * FROM table_name;');
        expect(values).toEqual([]);
    });

    test('SELECT with ALIAS and Subquery', () => {
        const {sql, values} = new Query({
            select: {
                test: 'name',
                age: true,
                subquery: new Query({
                    select: 'value',
                    from: 'another_table',
                })
            },
            from: 'table_name',
        });

        expect(sql).toEqual('SELECT name AS test, age, (SELECT value FROM another_table) AS subquery FROM table_name;');
        expect(values).toEqual([]);
    });

    test('SELECT with a INNER JOIN clause', () => {
        const {sql, values} = new Query({
            select: 'pr.title',
            from: ['employees', 'e'],
            innerJoin: {
                table: ['performance_reviews', 'pr'],
                on: {
                    conditions: {
                        'e.id': 'pr.employee_id',
                    }
                }
            }
        });

        expect(sql).toEqual('SELECT pr.title FROM employees AS e INNER JOIN performance_reviews AS pr ON e.id = pr.employee_id;');
        expect(values).toEqual([]);
    });

    test('SELECT with a LEFT JOIN clause', () => {
        const {sql, values} = new Query({
            select: 'performance_reviews.title',
            from: 'employees',
            leftJoin: {
                table: 'performance_reviews',
                on: {
                    conditions: {
                        'employees.id': 'performance_reviews.employee_id',
                    }
                }
            }
        });

        expect(sql).toEqual('SELECT performance_reviews.title FROM employees LEFT JOIN performance_reviews ON employees.id = performance_reviews.employee_id;');
        expect(values).toEqual([]);
    });

    test('SELECT with a RIGHT JOIN clause', () => {
        const {sql, values} = new Query({
            select: 'performance_reviews.title',
            from: 'employees',
            rightJoin: {
                table: 'performance_reviews',
                on: {
                    conditions: {
                        'employees.id': 'performance_reviews.employee_id',
                    }
                }
            }
        });

        expect(sql).toEqual('SELECT performance_reviews.title FROM employees RIGHT JOIN performance_reviews ON employees.id = performance_reviews.employee_id;');
        expect(values).toEqual([]);
    });

    test('SELECT with a FULL JOIN clause', () => {
        const {sql, values} = new Query({
            select: 'performance_reviews.title',
            from: 'employees',
            fullJoin: {
                table: 'performance_reviews',
                on: {
                    conditions: {
                        'employees.id': 'performance_reviews.employee_id',
                    }
                }
            }
        });

        expect(sql).toEqual('SELECT performance_reviews.title FROM employees FULL JOIN performance_reviews ON employees.id = performance_reviews.employee_id;');
        expect(values).toEqual([]);
    });

    test('SELECT with a CROSS JOIN clause', () => {
        const {sql, values} = new Query({
            select: 'performance_reviews.title',
            from: 'employees',
            crossJoin: {
                table: 'performance_reviews',
                on: {
                    conditions: {
                        'employees.id': 'performance_reviews.employee_id',
                    }
                }
            }
        });

        expect(sql).toEqual('SELECT performance_reviews.title FROM employees CROSS JOIN performance_reviews ON employees.id = performance_reviews.employee_id;');
        expect(values).toEqual([]);
    });

    test('SELECT with pattern mattching', () => {
        const {sql, values} = new Query({
            select: 'name',
            from: 'employees',
            where: {
                conditions: {
                    name: {
                        value: 'J%',
                        operator: 'LIKE'
                    }
                }
            }
        });

        expect(sql).toEqual('SELECT name FROM employees WHERE name LIKE ?;');
        expect(values).toEqual(['J%']);
    });

    test('SELECT with GROUP BY', () => {
        const {sql, values} = new Query({
            select: '*',
            from: 'table_name',
            groupBy: 'column1'
        });

        expect(sql).toEqual('SELECT * FROM table_name GROUP BY column1;');
        expect(values).toEqual([]);
    });

    test('SELECT with multiple GROUP BY', () => {
        const {sql, values} = new Query({
            select: '*',
            from: 'table_name',
            groupBy: ['column1', 'column2']
        });

        expect(sql).toEqual('SELECT * FROM table_name GROUP BY column1, column2;');
        expect(values).toEqual([]);
    });

    test('SELECT with multiple conditions using logical operators', () => {
        const {sql, values} = new Query({
            select: ['name', 'department'],
            from: 'employees',
            where: {
                conditions: {
                    department: 'HR',
                    age: {
                        value: 30,
                        operator: '>'
                    },
                    name: 'Stefan'
                },
                operators: ['OR', 'AND']
            }
        });

        expect(sql).toEqual('SELECT name, department FROM employees WHERE department = ? OR age > ? AND name = ?;');
        expect(values).toEqual(['HR', 30, 'Stefan']);
    });

    test('SELECT with multiple conditions using logical operators', () => {
        const {sql, values} = new Query({
            select: ['name', 'department'],
            from: 'employees',
            where: {
                conditions: {
                    department: 'HR',
                    name: 'Stefan'
                },
                operators: 'OR'
            }
        });

        expect(sql).toEqual('SELECT name, department FROM employees WHERE department = ? OR name = ?;');
        expect(values).toEqual(['HR', 'Stefan']);
    });

    test('SELECT with LIMIT', () => {
        const {sql, values} = new Query({
            select: '*',
            from: 'table_name',
            limit: 10
        });

        expect(sql).toEqual('SELECT * FROM table_name LIMIT ?;');
        expect(values).toEqual([10]);
    });

    test('SELECT with LIMIT and OFFSET', () => {
        const {sql, values} = new Query({
            select: '*',
            from: 'table_name',
            limit: 10,
            offset: 5
        });

        expect(sql).toEqual('SELECT * FROM table_name LIMIT ? OFFSET ?;');
        expect(values).toEqual([10, 5]);
    });

    test('SELECT with ORDER BY', () => {
        const {sql, values} = new Query({
            select: ['name', 'age'],
            from: 'employees',
            orderBy: [{by: 'age', order: 'DESC'}, {by: 'name', order: 'ASC'}]
        });

        expect(sql).toEqual('SELECT name, age FROM employees ORDER BY age DESC, name ASC;');
        expect(values).toEqual([]);
    });
});
