# Winston PostgreSQL transport

A easy to use Winston 3.x transport for PostgreSQL database.

- [Installation](#hammer_and_wrench-installation)
- [Usage](#memo-usage)
  - [With default table definition](#with-default-table-definition)
  - [With your own table](#with-your-own-table)
- [Licence](#balance_scale-licence)
- [Authors](#busts_in_silhouette-authors)
- [Contributors](#handshake-contributors)

## :hammer_and_wrench: Installation
To import the library you just need to run this command :
```shell
npm install @innova2/winston-pg
```

Make sure you have Winston, otherwise run this command :
```shell
npm install winston
```

## :memo: Usage
### With default table definition
The table is created automatically in case you don't have a log table.
```ts
const logger = new Logger({
  transports: [
    new Postgres({
      connectionString: 'your connection string',
      maxPool: 10,
      level: 'info',
      tableName: 'winston_logs',
    })
  ]
});
```

> The default table contains :
```ts
export class DefaultTable {
    id: string;
    level: string;
    timestamp: string;
    context: string;
    message: string;
    stack: any;
}
```

### With your own table definition
```ts
export class MyLogTable {
    level: string;
    timestamp: string;
    message: string;
    stack: any;
}
```
```ts
const pgTransport = new Postgres<MyLogTable>({
    connectionString: 'your connection string',
    maxPool: 10,
    level: 'info',
    tableName: 'winston_logs',
    tableColumns: [
        {
            name: 'level',
            dataType: 'VARCHAR'
        },
        {
            name: 'timestamp',
            dataType: 'TIMESTAMP'
        },
        {
            name: 'message',
            dataType: 'VARCHAR'
        },
        {
            name: 'stack',
            dataType: 'JSON'
        }
    ],
});

const logger = new Logger({
  transports: [pgTransport]
});
```

### Retrieve logs
You can use the query() method like :
```ts
pgTransport.query({
    fields: ['level', 'context'],
    limit: 20,
    page: 3, // Page 4 => first page is 0
    where: [
        {
            field: 'level',
            operator: 'equals',
            value: 'info',
        },
        {
            field: 'timestamp',
            operator: 'lte',
            value: '2021-10-12',
        },
    ],
    order: [
        ['id', 'DESC'],
    ],
});
```

> Note: the query() method return a Promise with results as PaginatedData
> if the limit option is filled or array otherwise 

Depending on the operator, the type of value can be different.
For example :
```ts
pgTransport.query({
   where: [
       {
           field: 'timestamp',
           operator: 'between',
           value: ['2021-10-11', '2021-10-16'],
       },
   ],
});
```

The list of operators with value's type :
```ts
type EqualsOperator = 'equals' | 'notEquals';
// value can be : string | number | boolean;

type TextOperator = 'like' | 'notLike' | 'ilike' | 'notIlike' | 'rlike';
// value can be : string;

type CalcOperator = 'gt' | 'gte' | 'lt' | 'lte';
// value can be : string | number;

type BetweenOperator = 'between' | 'notBetween';
// value can be : [string, string];
```

## :balance_scale: Licence
[MIT](LICENSE)

## :busts_in_silhouette: Authors
- [Adrien MARTINEAU](https://github.com/WaZeR-Adrien)
- [Angéline TOUSSAINT](https://github.com/AngelineToussaint)

## :handshake: Contributors
Do not hesitate to participate in the project!
Contributors list will be displayed below.
