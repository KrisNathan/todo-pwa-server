# To Do Progressive Web App

A lightweight sync server that requires very small storage footprint without it knowing the contents of the user's data.

All it does is verify the public key and signature with the encrypted data and cache it in memory for the other device to pull.

The objective of this server is ease of self hosting. It stores sync data in memory using redis. The short TTL balances against memory capacity in a small scale deployment. With some work, in a larger scale deployment horizontal scaling with sharding may be done thanks to redis. Shorter TTL doesn't mean poor data integrity, a conservative merge algorithm in the frontend solves this issue.

## Frontend & Home

https://github.com/KrisNathan/todo-pwa


## Development

This project tries to implement DDD for ease of implementing new features in the future.

```
npm install
npm run dev
```

```
open http://localhost:3000
```
