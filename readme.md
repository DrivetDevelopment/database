
# Drivet Database

[![npm](https://img.shields.io/npm/v/@drivet/database.svg)](https://www.npmjs.com/package/@drivet/database)

A simple database mainly for personal use. Uses [cat-loggr](https://www.npmjs.com/package/cat-loggr) as the main logger.

## Install

#### NPM
```
npm install @drivet/database
```

#### [Yarn](https://npmjs.com/package/yarn)

```
yarn add @drivet/database
```

## Connecting to the database

```js
const mysql = require('@drivet/database');
const client = new mysql();

client.connect({ 
  host: 'localhost',
  user: 'me',
  password: 'secret',
  database: 'my_db',
});
```