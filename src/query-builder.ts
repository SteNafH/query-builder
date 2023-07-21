import {InvalidQueryException} from "./query-exception";

//TODO -> CASE WHEN...
//TODO -> SELECT WITH VALUES
//TODO -> Functions

type Value = string | number | boolean | null | Query;

type ConditionValue = Value | (string | number | boolean | Query)[];

type ConditionOperator =
    '='
    | '!='
    | '>'
    | '<'
    | '>='
    | '<='
    | 'BETWEEN'
    | 'NOT BETWEEN'
    | 'LIKE'
    | 'NOT LIKE'
    | 'IN'
    | 'NOT IN';

interface Condition {
    value: ConditionValue;
    operator?: ConditionOperator | ConditionOperator[];
}

type ConditionsOperator = 'AND' | 'OR';

interface Conditions {
    conditions: Record<string, ConditionValue | Condition | (ConditionValue | Condition)[]>;
    operators?: ConditionsOperator | ConditionsOperator[];
}

interface Join {
    table: string | [string, string];
    using?: string | string[];
    on?: Conditions;
}

interface OrderBy {
    by: string;
    order: 'DESC' | 'ASC';
}

interface BaseQuery {
    explain?: string;
}

interface SelectQuery extends BaseQuery {
    select: string | string[] | Record<string, true | string | Query>;
    distinct?: boolean;
    from: string | [string, string];
    innerJoin?: Join | Join[];
    leftJoin?: Join | Join[];
    rightJoin?: Join | Join[];
    fullJoin?: Join | Join[];
    crossJoin?: Join | Join[];
    where?: Conditions;
    having?: Conditions;
    groupBy?: string | string[];
    orderBy?: string | OrderBy | (string | OrderBy)[];
    limit?: number;
    offset?: number;
}

interface UpdateQuery extends BaseQuery {
    update: string | string[];
    set: Record<string, Value>;
    innerJoin?: Join | Join[];
    leftJoin?: Join | Join[];
    rightJoin?: Join | Join[];
    fullJoin?: Join | Join[];
    crossJoin?: Join | Join[];
    where?: Conditions;
    orderBy?: string | OrderBy | (string | OrderBy)[];
    limit?: number;
}

interface Insert {
    table: string;
    columns?: string[];
}

interface InsertQuery extends BaseQuery {
    insert: Insert;
    ignore?: boolean;
    select?: Query | Query[];
    values?: Value[] | Value[][];
    set?: Record<string, Value>;
}

interface DeleteQuery extends BaseQuery {
    delete: true | string | string[];
    from: string | [string, string];
    innerJoin?: Join | Join[];
    leftJoin?: Join | Join[];
    rightJoin?: Join | Join[];
    fullJoin?: Join | Join[];
    crossJoin?: Join | Join[];
    where?: Conditions;
    orderBy?: string | OrderBy | (string | OrderBy)[];
    limit?: number;
}

type PossibleQueries = SelectQuery | UpdateQuery | InsertQuery | DeleteQuery;

interface QueryType {
    sql: string;
    values: (any | any[])[];
}

class Query implements QueryType {
    public sql: string;
    public values: (any | any[])[];

    constructor(query: PossibleQueries) {
        this.sql = '';
        this.values = [];

        if (this.isSelect(query))
            this.handleSelect(query);
        else if (this.isUpdate(query))
            this.handleUpdate(query);
        else if (this.isInsert(query))
            this.handleInsert(query);
        else if (this.isDelete(query))
            this.handleDelete(query);
        else
            throw new InvalidQueryException('Query Type Not Found');
    }

    private handleOrderBy(orderBy: string | OrderBy | (string | OrderBy)[]): string {
        if (typeof orderBy === 'string')
            return orderBy;

        if (!Array.isArray(orderBy))
            return `${orderBy.by} ${orderBy.order}`;

        return orderBy.map(orderBy => this.handleOrderBy(orderBy)).join(', ');
    }

    private handleJoin(join: Join): QueryType {
        const sql: string[] = [];
        const values: (any | any[])[] = [];

        if (Array.isArray(join.table))
            sql.push(`${join.table[0]} AS ${join.table[1]}`);
        else
            sql.push(join.table);

        if (join.using) {
            const using = Array.isArray(join.using) ? join.using.join(', ') : join.using;
            sql.push(`USING (${using})`);
        }

        if (join.on) {
            const on = this.handleConditions(join.on);
            sql.push(on.sql);
            values.push(...on.values);
        }

        return {sql: sql.join(' '), values: values};
    }

    private handleConditions(conditions: Conditions): QueryType {
        throw new Error('Not Implemented');
    }

    private handleSet(set: Record<string, Value>): QueryType {
        const sql: string[] = [];
        const values: (any | any[])[] = [];

        for (const col in set) {
            const value = this.handleValue(set[col]);
            sql.push(`${col} = ${value.sql}`);
            values.push(...value.values);
        }

        return {sql: sql.join(', '), values: values};
    }

    private handleValue(value: Value): QueryType {
        if (value instanceof Query)
            return {sql: `(${value.sql})`, values: value.values};

        return {sql: '?', values: [value]};
    }

    private handleSelect(query: SelectQuery): void {
        const sql: string[] = [];
        const values: (any | any[])[] = [];

        if (query.explain)
            sql.push('EXPLAIN');

        sql.push('SELECT');

        if (query.distinct)
            sql.push('DISTINCT');

        if (typeof query.select === 'string')
            sql.push(query.select);
        else if (Array.isArray(query.select))
            sql.push(query.select.join(', '));
        else {
            const columns: string[] = [];
            for (const column in query.select) {
                const value = query.select[column];

                if (value === true)
                    columns.push(column);
                else if (typeof value === 'string')
                    columns.push(`${value} AS ${column}`);
                else {
                    columns.push(`(${value.sql})`);
                    values.push(...value.values);
                }
            }

            sql.push(columns.join(', '));
        }

        if (Array.isArray(query.from))
            sql.push(`FROM ${query.from[0]} AS ${query.from[1]}`);
        else
            sql.push(`FROM ${query.from}`);

        if (query.innerJoin) {
            const innerJoins = Array.isArray(query.innerJoin) ? query.innerJoin : [query.innerJoin];

            for (const innerJoin of innerJoins) {
                const join = this.handleJoin(innerJoin);
                sql.push(`INNER JOIN ${join.sql}`);
                values.push(...join.values);
            }
        }

        if (query.leftJoin) {
            const leftJoins = Array.isArray(query.leftJoin) ? query.leftJoin : [query.leftJoin];

            for (const leftJoin of leftJoins) {
                const join = this.handleJoin(leftJoin);
                sql.push(`LEFT JOIN ${join.sql}`);
                values.push(...join.values);
            }
        }

        if (query.rightJoin) {
            const rightJoins = Array.isArray(query.rightJoin) ? query.rightJoin : [query.rightJoin];

            for (const rightJoin of rightJoins) {
                const join = this.handleJoin(rightJoin);
                sql.push(`RIGHT JOIN ${join.sql}`);
                values.push(...join.values);
            }
        }

        if (query.fullJoin) {
            const fullJoins = Array.isArray(query.fullJoin) ? query.fullJoin : [query.fullJoin];

            for (const fullJoin of fullJoins) {
                const join = this.handleJoin(fullJoin);
                sql.push(`FULL JOIN ${join.sql}`);
                values.push(...join.values);
            }
        }

        if (query.crossJoin) {
            const crossJoins = Array.isArray(query.crossJoin) ? query.crossJoin : [query.crossJoin];

            for (const crossJoin of crossJoins) {
                const join = this.handleJoin(crossJoin);
                sql.push(`CROSS JOIN ${join.sql}`);
                values.push(...join.values);
            }
        }

        if (query.where) {
            const where = this.handleConditions(query.where);
            sql.push(`WHERE ${where.sql}`);
        }

        if (query.having) {
            const having = this.handleConditions(query.having);
            sql.push(`HAVING ${having.sql}`);
            values.push(...having.values);
        }

        if (query.groupBy)
            if (Array.isArray(query.groupBy))
                sql.push(`GROUP BY ${query.groupBy.join(', ')}`);
            else
                sql.push(`GROUP BY ${query.groupBy}`);

        if (query.orderBy)
            sql.push(`ORDER BY ${this.handleOrderBy(query.orderBy)}`);

        if (query.limit) {
            sql.push('LIMIT = ?');
            values.push(query.limit);
        }

        if (query.offset) {
            sql.push('OFFSET = ?');
            values.push(query.offset);
        }

        this.sql = sql.join(' ');
        this.values = values;
    }

    private handleUpdate(query: UpdateQuery): void {
        const sql: string[] = [];
        const values: (any | any[])[] = [];

        if (query.explain)
            sql.push('EXPLAIN');

        sql.push('UPDATE');

        if (Array.isArray(query.update))
            sql.push(query.update.join(', '));
        else
            sql.push(query.update);

        const set = this.handleSet(query.set);
        sql.push(`SET ${set.sql}`);
        values.push(...set.values);

        if (query.innerJoin) {
            const innerJoins = Array.isArray(query.innerJoin) ? query.innerJoin : [query.innerJoin];

            for (const innerJoin of innerJoins) {
                const join = this.handleJoin(innerJoin);
                sql.push(`INNER JOIN ${join.sql}`);
                values.push(...join.values);
            }
        }

        if (query.leftJoin) {
            const leftJoins = Array.isArray(query.leftJoin) ? query.leftJoin : [query.leftJoin];

            for (const leftJoin of leftJoins) {
                const join = this.handleJoin(leftJoin);
                sql.push(`LEFT JOIN ${join.sql}`);
                values.push(...join.values);
            }
        }

        if (query.rightJoin) {
            const rightJoins = Array.isArray(query.rightJoin) ? query.rightJoin : [query.rightJoin];

            for (const rightJoin of rightJoins) {
                const join = this.handleJoin(rightJoin);
                sql.push(`RIGHT JOIN ${join.sql}`);
                values.push(...join.values);
            }
        }

        if (query.fullJoin) {
            const fullJoins = Array.isArray(query.fullJoin) ? query.fullJoin : [query.fullJoin];

            for (const fullJoin of fullJoins) {
                const join = this.handleJoin(fullJoin);
                sql.push(`FULL JOIN ${join.sql}`);
                values.push(...join.values);
            }
        }

        if (query.crossJoin) {
            const crossJoins = Array.isArray(query.crossJoin) ? query.crossJoin : [query.crossJoin];

            for (const crossJoin of crossJoins) {
                const join = this.handleJoin(crossJoin);
                sql.push(`CROSS JOIN ${join.sql}`);
                values.push(...join.values);
            }
        }

        if (query.where) {
            const where = this.handleConditions(query.where);
            sql.push(`WHERE ${where.sql}`);
        }

        if (query.orderBy)
            sql.push(`ORDER BY ${this.handleOrderBy(query.orderBy)}`);

        if (query.limit) {
            sql.push('LIMIT = ?');
            values.push(query.limit);
        }

        this.sql = sql.join(' ');
        this.values = values;
    }

    private handleInsert(query: InsertQuery): void {
        const sql: string[] = [];
        const values: (any | any[])[] = [];

        if (query.explain)
            sql.push('EXPLAIN');

        sql.push('INSERT');

        if (query.ignore)
            sql.push('IGNORE');

        sql.push('INTO');
        sql.push(query.insert.table);

        if (query.insert.columns)
            sql.push(`(${query.insert.columns.join(', ')})`);

        const select = query.select;
        if (select instanceof Query) {
            sql.push(select.sql);
            values.push(...select.values);
        } else if (Array.isArray(select)) {
            const selectSql: string[] = [];
            const selectValues: (any | any[])[] = [];

            for (const query of select) {
                selectSql.push(query.sql);
                selectValues.push(...query.values);
            }

            sql.push(selectSql.join(' UNION '));
            values.push(...selectValues);
        }

        const insertValues = query.values;
        if (insertValues === undefined) {
        } else if (this.isValues(insertValues)) {
            for (const row of insertValues) {
                const rowSql: string[] = [];
                const rowValues: (any | any[])[] = [];

                for (const col of row) {
                    const value = this.handleValue(col);
                    rowSql.push(value.sql);
                    rowValues.push(...value.values);
                }

                sql.push(`(${rowSql.join(', ')})`);
                values.push(...rowValues);
            }
        } else {
            const rowSql: string[] = [];
            const rowValues: (any | any[])[] = [];

            for (const col of insertValues) {
                const value = this.handleValue(col);
                rowSql.push(value.sql);
                rowValues.push(...value.values);
            }

            sql.push(`(${rowSql.join(', ')})`);
            values.push(...rowValues);
        }

        if (query.set) {
            const set = this.handleSet(query.set);
            sql.push(`SET ${set.sql}`);
            values.push(...set.values);
        }

        this.sql = sql.join(' ');
        this.values = values;
    }

    private isValues(values: Value[] | Value[][]): values is Value[][] {
        return Array.isArray(values) && Array.isArray(values.at(0));
    }

    private handleDelete(query: DeleteQuery): void {
        const sql: string[] = [];
        const values: (any | any[])[] = [];

        if (query.explain)
            sql.push('EXPLAIN');

        sql.push('DELETE');

        if (typeof query.delete === 'string')
            sql.push(query.delete);
        else if (Array.isArray(query.delete))
            sql.push(query.delete.join(', '));

        if (Array.isArray(query.from))
            sql.push(`FROM ${query.from[0]} AS ${query.from[1]}`);
        else
            sql.push(`FROM ${query.from}`);

        if (query.innerJoin) {
            const innerJoins = Array.isArray(query.innerJoin) ? query.innerJoin : [query.innerJoin];

            for (const innerJoin of innerJoins) {
                const join = this.handleJoin(innerJoin);
                sql.push(`INNER JOIN ${join.sql}`);
                values.push(...join.values);
            }
        }

        if (query.leftJoin) {
            const leftJoins = Array.isArray(query.leftJoin) ? query.leftJoin : [query.leftJoin];

            for (const leftJoin of leftJoins) {
                const join = this.handleJoin(leftJoin);
                sql.push(`LEFT JOIN ${join.sql}`);
                values.push(...join.values);
            }
        }

        if (query.rightJoin) {
            const rightJoins = Array.isArray(query.rightJoin) ? query.rightJoin : [query.rightJoin];

            for (const rightJoin of rightJoins) {
                const join = this.handleJoin(rightJoin);
                sql.push(`RIGHT JOIN ${join.sql}`);
                values.push(...join.values);
            }
        }

        if (query.fullJoin) {
            const fullJoins = Array.isArray(query.fullJoin) ? query.fullJoin : [query.fullJoin];

            for (const fullJoin of fullJoins) {
                const join = this.handleJoin(fullJoin);
                sql.push(`FULL JOIN ${join.sql}`);
                values.push(...join.values);
            }
        }

        if (query.crossJoin) {
            const crossJoins = Array.isArray(query.crossJoin) ? query.crossJoin : [query.crossJoin];

            for (const crossJoin of crossJoins) {
                const join = this.handleJoin(crossJoin);
                sql.push(`CROSS JOIN ${join.sql}`);
                values.push(...join.values);
            }
        }

        if (query.where) {
            const where = this.handleConditions(query.where);
            sql.push(`WHERE ${where.sql}`);
        }

        if (query.orderBy)
            sql.push(`ORDER BY ${this.handleOrderBy(query.orderBy)}`);

        if (query.limit) {
            sql.push('LIMIT = ?');
            values.push(query.limit);
        }

        this.sql = sql.join(' ');
        this.values = values;
    }

    private isSelect(query: PossibleQueries): query is SelectQuery {
        return "select" in query && !("insert" in query);
    }

    private isUpdate(query: PossibleQueries): query is UpdateQuery {
        return "update" in query;
    }

    private isInsert(query: PossibleQueries): query is InsertQuery {
        return "insert" in query;
    }

    private isDelete(query: PossibleQueries): query is DeleteQuery {
        return "delete" in query;
    }
}

export default Query;
