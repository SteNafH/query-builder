import {InvalidQueryException} from "./query-exception";

type ConditionValue = string | number | boolean | null | Query | string[] | number[] | boolean[] | Query[];

type ConditionOperator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'BETWEEN' | 'NOT BETWEEN' | 'LIKE' | 'NOT LIKE' | 'IN' | 'NOT IN';

interface Condition {
    value: ConditionValue;
    operator?: ConditionOperator | ConditionOperator[];
}

type WhereOperator =  'AND' | 'OR';

interface Where {
    conditions: Record<string, ConditionValue | ConditionValue[] | Condition | Condition[]>;
    operators?: WhereOperator | WhereOperator[];
}

interface BaseJoin {
    table: string;
}

interface UsingJoin extends BaseJoin {
    using: string | string[];
    on?: never;
}

interface OnJoin extends BaseJoin {
    on: Record<string, ConditionValue | ConditionValue[] | Condition | Condition[]>;
    using?: never;
}

type Join = UsingJoin | OnJoin;

interface OrderBy {
    column: string;
    order: 'DESC' | 'ASC';
}

interface SelectQuery {
}

interface UpdateQuery {
}

interface InsertQuery {
}

interface DeleteQuery {
    delete: true | string | string[];
    from: string | string[];
    innerJoin?: Join;
    leftJoin?: Join;
    rightJoin?: Join;
    outerJoin?: Join;
    where?: Where;
    orderBy?: string | string[] | OrderBy | OrderBy[];
    limit?: number;
}

type BaseQuery = SelectQuery | UpdateQuery | InsertQuery | DeleteQuery;

class Query {
    public sql: string;
    public values: (any | any[])[];

    constructor(query: BaseQuery) {
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

    private isSelect(query: BaseQuery): query is SelectQuery {
        return "select" in query;
    }

    private isUpdate(query: BaseQuery): query is UpdateQuery {
        return "update" in query;
    }

    private isInsert(query: BaseQuery): query is InsertQuery {
        return "insert" in query;
    }

    private isDelete(query: BaseQuery): query is DeleteQuery {
        return "delete" in query;
    }
}

export default Query;
