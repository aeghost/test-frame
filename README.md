# TestFrame v0.1.0

The objective is just to provide a minimalist and simple frame to validate a HTTP/S API like REST based or GraphQL based API.

It should stay explicit, easy to use and to customize.

# Deps

You may have to dispose of Python because of "commander" package, will disapear.

```json
{
  "axios": "^0.19.2",
  "colors": "^1.4.0",
  "commander": "^5.1.0",
  "sleep": "^6.2.0"
}
```

# Usage

Install this package and include it into any js file :

```js
const ApiTest = require('../../index');

// Package come with a Check module that has predefined functions to check common types.
const Check = ApiTest.check;

// Send GET message to /hello and check the returned value is a string and strictly 'hello'.
ApiTest.get(
  '/hello'
  , (v) =>
      Check.typ.string(v)
      && v === 'hello'
  , 'Get hello message from server'
  , 'STANDARD API'
);

// You can define custom common functions by overriding Check ones.
Check.success = v => !!v['result'] && v.result === 'success';

// Send POST message with { name: 'foo_0' } payload and check return according Check.success.
ApiTest.post(
    `/post/user`
    , { name: 'foo_0' }
    , (v) => Check.success(v)
    , `Post foo_0 user`
    , 'USER API MANAGEMENT'
);


// Send POST message with a bad payload and check that it does lead to a managed error.
Check.error = v => !!v['result'] && v.result === 'failed';
ApiTest.post(
    `/post/user`
    , { bad_value: 'bad_content' }
    , (v) => Check.error(v)
    , `Post a bad payload to add user`
    , 'USER API MANAGEMENT'
);

// You have access to 'testFor' function calling the s => { ... } function for all [ 'foo_1', ... ] list elements.
ApiTest.testFor(['foo_1', 'foo_2', 'foo_3'], s => {
  ApiTest.post(
    `/post/user`
    , { name: s }
    , (v) => Check.success(v)
    , `Post ${s} user`
    , 'USER API MANAGEMENT'
  );
});

// When every test is declared use ApiTest.run() function to run everything.
ApiTest.run();
```

Then run tests using node interpreter

```
$ node tests/hello/hello.js --help

Usage: hello [options] <url>

Options:
  -ss, --selfSigned <bool>              Accept Self Signed Certificate
  -ucao, --useAuthorityOnly <bool>      Use only authority file
  -ca, --authority <path>               Path to certificate authority file
  -cert, --certificate <path>           Path to certificate file
  -pk, --privateKey <path>              Path to the associate private key file
  -up12, --usePkcs12 <bool>             Use P12 file
  -p12, --pkcs12 <path>                 Path to the associate P12 file
  -p12pw, --pkcs12Password <string>     Password associated with the P12 file
  -https, --useHttps <bool>             Should use HTTPS instead of HTTP
  -vr, --verboseResponse <bool>         Should print server responses
  -vr, --verboseError <bool>            Should print server errors responses
  -a, --await <[1; 360000] as integer>  Set an await time between requests
  -m, --matching <string>               Execute tests matching given string
  -pn, --productName <string>           Execute parametered product named tests
  -h, --help                            display help for command

$ node tests/hello/hello.js http://127.0.0.1:4200/
```
