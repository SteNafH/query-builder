import Query from "../src/query-builder";

describe('DELETE Query', () => {

    test('Basic DELETE', () => {
        const {sql, values} = new Query({
            delete: true,
            from: 'table_name',
        });

        expect(sql).toEqual('DELETE FROM table_name;');
        expect(values).toEqual([]);
    });

    test('DELETE with WHERE clause', () => {
        const {sql, values} = new Query({
            delete: true,
            from: 'table_name',
            where: {
                conditions: {
                    id: 1,
                },
            },
        });

        expect(sql).toEqual('DELETE FROM table_name WHERE id = ?;');
        expect(values).toEqual([1]);
    });

    test('DELETE with ORDER BY and LIMIT', () => {
        const {sql, values} = new Query({
            delete: true,
            from: 'table_name',
            orderBy: 'column_name',
            limit: 10,
        });

        expect(sql).toEqual('DELETE FROM table_name ORDER BY column_name LIMIT ?;');
        expect(values).toEqual([10]);
    });

    test('DELETE with JOIN', () => {
        const {sql, values} = new Query({
            delete: 't1',
            from: ['table_name1', 't1'],
            innerJoin: {
                table: ['table_name2', 't2'],
                on: {
                    conditions: {
                        ['t1.column_name']: 't2.column_name',
                    },
                },
            },
        });

        expect(sql).toEqual('DELETE t1 FROM table_name1 AS t1 INNER JOIN table_name2 AS t2 ON t1.column_name = t2.column_name;');
        expect(values).toEqual([]);
    });

    test('DELETE with Subquery', () => {
        const {sql, values} = new Query({
            delete: true,
            from: 'table_name',
            where: {
                conditions: {
                    column_name: {
                        value: new Query({
                            select: 'column_name',
                            from: 'other_table',
                            where: {
                                conditions: {
                                    id: 1,
                                },
                            },
                        }),
                        operator: 'IN',
                    },
                },
            },
        });

        expect(sql).toEqual('DELETE FROM table_name WHERE column_name IN (SELECT column_name FROM other_table WHERE id = ?);');
        expect(values).toEqual([1]);
    });

    test('DELETE using Aliases', () => {
        const {sql, values} = new Query({
            delete: 't1',
            from: ['table_name', 't1'],
        });

        expect(sql).toEqual('DELETE t1 FROM table_name AS t1;');
        expect(values).toEqual([]);
    });
});
