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
    innerJoin?: Join;
    leftJoin?: Join;
    rightJoin?: Join;
    fullJoin?: Join;
    crossJoin?: Join;
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
    innerJoin?: Join;
    leftJoin?: Join;
    rightJoin?: Join;
    fullJoin?: Join;
    crossJoin?: Join;
    where?: Conditions;
    orderBy?: string | OrderBy | (string | OrderBy)[];
    limit?: number;
}

interface Insert {
    table: string;
    columns: string[];
}

interface InsertQuery extends BaseQuery {
    insert: Insert;
    ignore?: boolean;
    select?: SelectQuery | SelectQuery[];
    values?: Value[] | Value[][];
    set?: Record<string, Value>;
}

interface DeleteQuery extends BaseQuery {
    delete: true | string | string[];
    from: string | [string, string];
    innerJoin?: Join;
    leftJoin?: Join;
    rightJoin?: Join;
    fullJoin?: Join;
    crossJoin?: Join;
    where?: Conditions;
    orderBy?: string | OrderBy | (string | OrderBy)[];
    limit?: number;
}

type PossibleQueries = SelectQuery | UpdateQuery | InsertQuery | DeleteQuery;

class Query {
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
            sql.push(`${query.from[0]} AS ${query.from[1]}`);
        else
            sql.push(query.from);

        //TODO joins
        //TODO where
        //TODO having

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

    }

    private handleInsert(query: InsertQuery): void {

    }

    private handleDelete(query: DeleteQuery): void {

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
