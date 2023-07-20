import {InvalidQueryException} from "./query-exception";

//TODO -> CASE WHEN...
//TODO -> SELECT WITH VALUES
//TODO -> Functions

type Value = string | number | boolean | null | Query;

type ConditionValue = Value | (string | number | boolean | Query)[];

type ConditionOperator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'BETWEEN' | 'NOT BETWEEN' | 'LIKE' | 'NOT LIKE' | 'IN' | 'NOT IN';

interface Condition {
    value: ConditionValue;
    operator?: ConditionOperator | ConditionOperator[];
}

type ConditionsOperator =  'AND' | 'OR';

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
    select: string | [string, string] | (string | [string, string])[] | Record<string, true | string | Query>;
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

    private handleSelect(query: SelectQuery): void {

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
