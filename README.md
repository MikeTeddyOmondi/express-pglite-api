# Express PGlite API

This application uses [PGlite](https://github.com/electric-sql/pglite) (Postgres powered by WASM)

Generate schema in PGlite database

```shell
pnpm generate:migrations 
```

Run migrations in sqlite database

```shell
# node ./src/migrate.js
pnpm run:migrations 

```

Benchmarks: Using the rewrk HTTP load benchmarker
```shell 
rewrk -c 256 -d 60s -h http://localhost:3489/todos --pct
```
