# Express Session RethinkDB

RethinkDB session store for Express 4.x

## Installation

```bash
# yarn:
yarn add @geo1088/express-session-rethinkdb
# npm:
npm install --save @geo1088/express-session-rethinkdb
```

## Dependencies

- [`express-session`](https://www.npmjs.com/package/express-session) (duh)
- [`rethinkdbdash`](https://www.npmjs.com/package/rethinkdbdash) for connecting to RethinkDB. **The official driver is not supported.**

### Without an existing database connection

```js
var express = require('express');
var session = require('express-session');
var RDBStore = require('express-session-rethinkdb')(session);

var app = express();
var rdbStore = new RDBStore({
  connectOptions: {
    servers: [
      { host: '192.168.0.100', port: 28015 },
      { host: '192.168.0.101', port: 28015 },
      { host: '192.168.0.102', port: 28015 }
    ],
    db: 'test',
    discovery: false,
    pool: false,
    buffer: 50,
    max: 1000,
    timeout: 20,
    timeoutError: 1000
  },
  table: 'session',
  sessionTimeout: 86400000,
  flushInterval: 60000,
  debug: false
});

app.use(session({
  key: 'sid',
  secret: 'my5uperSEC537(key)!',
  cookie: { maxAge: 860000 },
  store: rdbStore
}));

// the rest of your server code..
```

### With an existing connection

```javascript
const express = require('express');
const session = require('express-session');
const RDBStore = require('express-session-rethinkdb')(session);

const r = require('rethinkdbdash')({
  // Your database configuration...
  db: "test"
})

const app = express();
const rdbStore = new RDBStore({
  // Pass a reference to your existing connection here
  connection: r,
  // Other store configuration
  table: 'session',
  sessionTimeout: 86400000,
  flushInterval: 60000,
  debug: false
});

app.use(session({
  key: 'sid',
  secret: 'my5uperSEC537(key)!',
  cookie: { maxAge: 860000 },
  store: rdbStore
}));

// the rest of your server code..
```

###### TODO: there was a Thinky example here. I don't know what that is, so I removed it.

## Constructor options

### `connection`
rethinkdbdash connection instance.
*See [RethinkDB's doc](http://www.rethinkdb.com/api/javascript/#connect)*
*Also see [rethinkdbdash](https://github.com/neumino/rethinkdbdash)*

### `connectOptions`
Options for connecting to the database server. (if connection is set connectOptions will be ignored)
*See [RethinkDB's doc](http://www.rethinkdb.com/api/javascript/#connect)*
*Also see [rethinkdbdash](https://github.com/neumino/rethinkdbdash)*

### `table`
Name of the table in which session data will be stored.
`Default: 'session'`

### `sessionTimeout`
If you do not set `cookie.maxAge` in `session` middleware, sessions will last until the user closes their browser.
However we cannot keep the session data infinitely (for size and security reasons).
In this case, this setting defines the maximum length of a session, even if the user does not close their browser.
`Default: 86400000` *1 day*

### `flushInterval`
RethinkDB does not yet provide an expiration function ( like ```SETEX``` for Redis ), so we have to remove the old expired sessions from the database intermittently. This is the time interval in milliseconds between flushing of expired sessions.
`Default: 60000` *60 seconds*

## Attribution

*Inspired by TJ Holowaychuk's [Connect Redis](https://github.com/visionmedia/connect-redis)*

*Inspired by guillaumervls [Connect RethinkDB](https://github.com/guillaumervls/connect-rethinkdb)*

## License

The MIT License (MIT)

Copyright (c) 2014-2015 Armen Filipetyan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
