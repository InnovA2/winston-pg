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

### With your own table
```ts
export class MyLogTable {
    level: string;
    timestamp: str;
    message: string;
    stack: any;
}
```
```ts
const logger = new Logger({
  transports: [
    new Postgres({
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
    })
  ]
});
```

## :balance_scale: Licence
[MIT](LICENSE)

## :busts_in_silhouette: Authors
- [Adrien MARTINEAU](https://github.com/WaZeR-Adrien)
- [Angéline TOUSSAINT](https://github.com/AngelineToussaint)

## :handshake: Contributors
Do not hesitate to participate in the project!
Contributors list will be displayed below.
