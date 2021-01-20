# sqlite-worker

<sup>**Social Media Photo by [Alexander Sinn](https://unsplash.com/@swimstaralex) on [Unsplash](https://unsplash.com/)**</sup>

A simple, and persistent, SQLite database for Web and Workers, based on [sql.js](https://github.com/sql-js/sql.js#readme) and [sqlite-tag](https://github.com/WebReflection/sqlite-tag#readme).



## How to use this module

The most important thing for this module to work, is being able to reach its pre-built, and pre-optimized files, via its own [dist](./dist/) folder.

The resolution is done automatically, whenever this modules is imported via native *ESM*, but due to [a long standing bug](https://stackoverflow.com/a/45578811/2800218) that involves both *Web* and *Service* *Workers* across browsers, such `dist` folder *must* be specified manually, whenever this module is used directly within either a *Service Worker*, or a generic *Web Worker*.



### Importing on Web pages via ESM

In any generic page, it is possible to import this module via native *ESM* with, or without, the help of a *CDN*:

```html
<script type="module">
// no ?module needed, it's the main export in unpkg
import {SQLiteWorker} from '//unpkg.com/sqlite-worker';

// `dist` option resolved automatically via import.meta.url
SQLiteWorker({name: 'my-db'})
  .then(async ({all, get, query}) => {
    await query`CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY, value TEXT)`;
    const {total} = await get`SELECT COUNT(id) as total FROM todos`;
    if (total < 1) {
      console.log('Inserting some value');
      await query`INSERT INTO todos (value) VALUES (${'a'})`;
      await query`INSERT INTO todos (value) VALUES (${'b'})`;
      await query`INSERT INTO todos (value) VALUES (${'c'})`;
    }
    console.log(await all`SELECT * FROM todos`);
  });
</script>
```

If the current [dist](./dist/) folder is pre-installed though, `import {SQLiteWorker} from './js/sqlite-worker/dist/index.js';` would work too.

While above example would run *sqlite-worker* through a *Web Worker*, which is recommended, it is also possible to bootstrap this module right away in the main thread.

```html
<script type="module">
// no ?module needed, it's the main export in unpkg
import {init} from '//unpkg.com/sqlite-worker';

// `dist` option resolved automatically via import.meta.url
init({name: 'my-db'}).then(async ({all, get, query}) => {
  // ... same code as before ...
});
</script>
```

Beside being slightly faster, avoiding the worker `postMessage` dance, the main difference between `SQLiteWorker` and `init` is that `init` accepts an extra **update** option, that could be used to synchronize remotely the local database, whenever it's needed.

```js
import {init} from 'sqlite-worker';

init({name: 'my-db', update(uInt8Array) {
  // store the latest uInt8Array somewhere
}});
```

The very same stored buffer could be used in the future to start from last stored update, in case the client erased its data (changed phone, IndexedDB cleared data, etc.).

This functionality could also be used in a *Service Worker*, but the initialization in there would be slightly different.



### Importing on Service Worker

Instead of `import`, we must use `importScripts` to have cross browser compatibility, but this is not an issue, as this module provides, through its [dist](./dist/) folder, everything needed to do so, as long as such folder is reachable:

```js
// will add a `sqliteWorker` "global" initiator
importScripts('./dist/sw.js');

/* ⚠ IMPORTANT ⚠ */
const dist = './dist/';

sqliteWorker({dist, name: 'my-db'})
  .then(async ({all, get, query}) => {
    await query`CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY, value TEXT)`;
    const {total} = await get`SELECT COUNT(id) as total FROM todos`;
    if (total < 1) {
      console.log('Inserting some value');
      await query`INSERT INTO todos (value) VALUES (${'a'})`;
      await query`INSERT INTO todos (value) VALUES (${'b'})`;
      await query`INSERT INTO todos (value) VALUES (${'c'})`;
    }
    console.table(await all`SELECT * FROM todos`);
  });
```

The **dist** option could also be used from generic pages, but usually with `import.meta.url` such information can be easily, automatically, retrieved by the module itself.


#### ℹ About Bundlers

Because of its own folder dependencies, including the *WASM* file, and the module, needed to bootstripe SQLite 3, importing this module via bundlers *might* break its actual execution if:

  * all files are not also included in the bundle folder
  * the bundler transform `import.meta.url` is a "*too smart*" way, breaking its native functionality
  * something else some bundler might do

However, as previously mentioned, if the `dist` option is provided, everything *should* be fine, even if bundled.



### Initialization Options

Both `init([options])` and `SQLiteWorker([options])` optionally accept a configuration/options object with the following fields:

  * **name**: the persistent database name. By default it's the *string* `'sqlite-worker'`
  * **dist**: the folder, as *string*, containing [all distribution files of this module](./dist/). This is resolved automatically on pages that are not workers, but it must be provided within workers when `importScripts` is used instead.
  * **database**: an initial SQLite database, as `Uint8Array` instance. This is used only the very first time, and it fallbacks to `new Uint8Array(0)`.
  * **timeout**: minimum interval, in milliseconds, between saves, to make storing, and exporting, the database, less greedy. By default it's the *number* `250`.


#### Direct init Extra Options

These options work only with direct initialization, so either in the main thread or via *Service Worker* (once fixed in Chrome) after importing its `init` export.

  * **update**: a *function* that receives latest version of the database, as `Uint8Array`, whenever some query executed an `INSERT`, a `DELETE`, or an `UPDATE`.


#### SQLiteWorker Extra Options

These options work only with `SQLiteWorker` initialization.

  * **worker**: the *string* path where the *JS* worker to use is located. By default, this is the [dist/worker.js](./dist/worker.js) file, which is a pre-optimized version of [this source](./esm/worker.js).
  * **credentials**: the optional credentials *string* between `omit`, `same-origin`, or `include`, defaulting to `omit`, or better, undefined credentials.



### After Initialization Helpers

Both `init(...)` and `SQLiteWorker(...)` resolves with the [sqlite-tag API](https://github.com/WebReflection/sqlite-tag#api), except for the `raw` utility, which is not implemented via the *Worker* interface, as it requires a special instance that won't survive `postMessage` dance, but it's exported within the direct `init(...)`, hence in the main thread or via *Service Worker*.

The API in a nutshell is:

  * **all**: a template literal tag to retrieve all rows that match the query
  * **get**: a template literal tag to retrieve one row that matches the query
  * **query**: a template literal tag to simply query the database (no result returned)

All tags are *asynchronous*, so that it's possible to *await* their result.



### Extra Initialization Helpers

The `sqlite-worker/tables` export helps defining, or modifying, tables at runtime, without needing to write complex logic, or queries.

All it's needed, is a `tables` property that describe the table name and its fields, handled via [sqlite-tables-handler](https://github.com/WebReflection/sqlite-tables-handler#readme), before returning all module helpers.

```js
import {init, SQLiteWorker} from 'sqlite-worker/tables';

init({
  name: 'test-db',
  // the tables schema
  tables: {
    todos: {
      id: 'INTEGER PRIMARY KEY',
      value: 'TEXT'
    }
  }
}).then(async ({all, get, query, raw}) => {
  const {total} = await get`SELECT COUNT(id) as total FROM todos`;
  if (total < 1) {
    console.log('Inserting some value');
    await query`INSERT INTO todos (value) VALUES (${'a'})`;
    await query`INSERT INTO todos (value) VALUES (${'b'})`;
    await query`INSERT INTO todos (value) VALUES (${'c'})`;
  }
  console.table(await all`SELECT * FROM todos`);
});
```

For *Service Worker* one must use the `dist/sw-tables.js` file instead of `dist/sw.js`.

```js
importScripts('./dist/sw-tables.js');

sqliteWorker({
  dist: './dist',
  name: 'my-db',
  tables: {
    todos: {
      id: 'INTEGER PRIMARY KEY',
      value: 'TEXT'
    }
  }
})
  .then(async ({all, get, query}) => {
    // ...
  });
```


## Compatibility

This module requires a browser compatible with *WASM* and native *ESM* `import`.

This module won't work in old Edge or IE.

**[Live Demo](https://webreflection.github.io/sqlite-worker/test/)** - please note if you read two *OK* after the list of expected errors (due code coverage) it means everything is fine and your browser works as expected.

**[CodePen](https://codepen.io/WebReflection/pen/NWROrom?editors=0010)** - will show the table result, as JSON, in the body.
