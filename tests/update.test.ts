import Query from "../src/query-builder";

describe('UPDATE Query', () => {
    test('Basic UPDATE with EXPLAIN clause', () => {
        const {sql, values} = new Query({
            explain: true,
            update: 'employees',
            set: {
                salary: 55000,
                age: 31
            },
        });

        expect(sql).toEqual('EXPLAIN UPDATE employees SET salary = ?, age = ?;');
        expect(values).toEqual([55000, 31]);
    });

    test('Basic UPDATE with a WHERE clause', () => {
        const {sql, values} = new Query({
            update: 'employees',
            set: {
                salary: 55000,
                age: 31
            },
            where: {
                conditions: {
                    age: {
                        value: 30,
                        operator: '>'
                    }
                }
            }
        });

        expect(sql).toEqual('UPDATE employees SET salary = ?, age = ? WHERE age > ?;');
        expect(values).toEqual([55000, 31, 30]);
    });

    test('UPDATE with a subquery in SET', () => {
        const {sql, values} = new Query({
            update: 'employees',
            set: {
                department: 'Management',
                name: new Query({
                    select: 'name',
                    from: 'table1',
                    where: {
                        conditions: {
                            id: 1
                        }
                    }
                })
            },
        });

        expect(sql).toEqual('UPDATE employees SET department = ?, name = (SELECT name FROM table1 WHERE id = ?);');
        expect(values).toEqual(['Management', 1]);
    });

    test('UPDATE with a subquery in WHERE', () => {
        const {sql, values} = new Query({
            update: 'employees',
            set: {
                department: 'Management'
            },
            where: {
                conditions: {
                    id: {
                        value: new Query({
                            select: 'employee_id',
                            from: 'project_assignments',
                            where: {
                                conditions: {
                                    project_name: 'New Project',
                                }
                            }
                        }),
                        operator: 'IN'
                    }
                }
            },
        });

        expect(sql).toEqual('UPDATE employees SET department = ? WHERE id IN (SELECT employee_id FROM project_assignments WHERE project_name = ?);');
        expect(values).toEqual(['Management', 'New Project']);
    });

    test('UPDATE with a INNER JOIN clause', () => {
        const {sql, values} = new Query({
            update: ['employees', 'e'],
            set: {
                'e.salary': 40,
            },
            innerJoin: {
                table: ['performance_reviews', 'pr'],
                on: {
                    conditions: {
                        'e.id': 'pr.employee_id',
                    }
                }
            }
        });

        expect(sql).toEqual('UPDATE employees AS e INNER JOIN performance_reviews AS pr ON e.id = pr.employee_id SET e.salary = ?;');
        expect(values).toEqual([40]);
    });

    test('UPDATE with a LEFT JOIN clause', () => {
        const {sql, values} = new Query({
            update: ['employees', 'e'],
            set: {
                'e.salary': 40,
            },
            leftJoin: {
                table: ['performance_reviews', 'pr'],
                on: {
                    conditions: {
                        'e.id': 'pr.employee_id',
                    }
                }
            }
        });

        expect(sql).toEqual('UPDATE employees AS e LEFT JOIN performance_reviews AS pr ON e.id = pr.employee_id SET e.salary = ?;');
        expect(values).toEqual([40]);
    });

    test('UPDATE with a RIGHT JOIN clause', () => {
        const {sql, values} = new Query({
            update: ['employees', 'e'],
            set: {
                'e.salary': 40,
            },
            rightJoin: {
                table: ['performance_reviews', 'pr'],
                on: {
                    conditions: {
                        'e.id': 'pr.employee_id',
                    }
                }
            }
        });

        expect(sql).toEqual('UPDATE employees AS e RIGHT JOIN performance_reviews AS pr ON e.id = pr.employee_id SET e.salary = ?;');
        expect(values).toEqual([40]);
    });

    test('UPDATE with a CROSS JOIN clause', () => {
        const {sql, values} = new Query({
            update: ['employees', 'e'],
            set: {
                'e.salary': 40,
            },
            crossJoin: {
                table: ['performance_reviews', 'pr'],
                on: {
                    conditions: {
                        'e.id': 'pr.employee_id',
                    }
                }
            }
        });

        expect(sql).toEqual('UPDATE employees AS e CROSS JOIN performance_reviews AS pr ON e.id = pr.employee_id SET e.salary = ?;');
        expect(values).toEqual([40]);
    });

    test('UPDATE with a LIMIT clause ', () => {
        const {sql, values} = new Query({
            update: 'employees',
            set: {
                department: 'Temporary'
            },
            where: {
                conditions: {
                    status: 'Contract'
                }
            },
            limit: 3
        });

        expect(sql).toEqual('UPDATE employees SET department = ? WHERE status = ? LIMIT ?;');
        expect(values).toEqual(['Temporary', 'Contract', 3]);
    });

    test('UPDATE with a ORDER BY clause ', () => {
        const {sql, values} = new Query({
            update: 'employees',
            set: {
                department: 'Temporary'
            },
            where: {
                conditions: {
                    status: 'Contract'
                }
            },
            orderBy: {
                by: 'hire_date',
                order: 'ASC'
            },
        });

        expect(sql).toEqual('UPDATE employees SET department = ? WHERE status = ? ORDER BY hire_date ASC;');
        expect(values).toEqual(['Temporary', 'Contract']);
    });
});
