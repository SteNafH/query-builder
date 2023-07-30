# Query Builder

This Query Builder is a versatile and flexible utility for generating SQL queries in TypeScript and JavaScript. It
simplifies the process of creating complex SQL queries with dynamic conditions and joins. This README provides an
overview of the Query class and its features.

## Getting Started

To start using the Query class, you need to import it into your TypeScript code as shown below:

```typescript
import Query, {InvalidQueryException} from "./query";
```

### Supported Query Types

The `Query` class supports the following types of SQL queryies:

1. **SelectQuery**: Used for SELECT statements.
2. **UpdateQuery**: Used for UPDATE statements.
3. **InsertQuery**: Used for INSERT statements.
4. **DeleteQuery**: Used for DELETE statements.

Each query type corresponds to an interface (`SelectQuery`, `UpdateQuery`, `InsertQuery`, and `DeleteQuery`) with
specific properties to define the SQL query.

## Usage Examples

### Select Query Example

```typescript
const query = new Query({
    select: ["name", "age"],
    from: "users",
    where: {
        conditions: {
            age: {value: 30, operator: ">"},
            country: "USA",
        },
    },
    orderBy: {by: "age", order: "DESC"},
    limit: 10,
});

console.log(query.sql); // Output: SELECT name, age FROM users WHERE age > ? AND country = ? ORDER BY age DESC LIMIT ?
console.log(query.values); // Output: [30, "USA"]
```

### Update Query Example

```typescript
const query = new Query({
    update: "users",
    set: {status: "active"},
    where: {
        conditions: {
            age: {value: 18, operator: ">="},
            country: ["USA", "Canada"],
        },
    },
    limit: 100,
});

console.log(query.sql); // Output: UPDATE users SET status = ? WHERE age >= ? AND country IN (?, ?) LIMIT ?
console.log(query.values); // Output: ["active", 18, "USA", "Canada", 100]
```

### Insert Query Example

```typescript
const query = new Query({
    insert: {table: "users", columns: ["name", "email"]},
    values: [["John Doe", "john@example.com"], ["Jane Smith", "jane@example.com"]],
});

console.log(query.sql); // Output: INSERT INTO users (name, email) VALUES (?, ?), (?, ?)
console.log(query.values); // Output: ["John Doe", "john@example.com", "Jane Smith", "jane@example.com"]
```

### Delete Query Example

```typescript
const query = new Query({
    delete: "users",
    from: "customers",
    where: {
        conditions: {"users.id": {value: 42, operator: ">"}},
    },
});

console.log(query.sql); // Output: DELETE users FROM customers WHERE users.id > ?
console.log(query.values); // Output: [42]
```

## Exception Handling
The `Query` class throws an `InvalidQueryException` if an unsupported or invalid query type is provided during
initialization. This ensures that only valid query types are processed.

## Conclusion
The `Query` class provides a convenient way to construct complex SQL queries with ease. Its flexibility and support for
various query types make it a valuable tool for database interactions in TypeScript projects. Feel free to explore the
class further and incorporate it into your application for efficient SQL query generation.
