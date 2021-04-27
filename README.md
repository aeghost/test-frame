# TestFrame v0.1.0

The objective is just to provide a minimalist and simple frame to send easily and validate a HTTP API like REST based or GraphQL based API.

It should stay explicit and easy to use and customize.

# Deps

You may have to dispose of Python because of "program" package, will disapear.

```json
{
  "axios": "^0.19.2",
  "colors": "^1.4.0",
  "commander": "^5.1.0",
  "sleep": "^6.2.0"
}
```

# Usage

First install this package and include it into any js file:

```js
const ApiTest = require('../../index');
const Check = ApiCheck.check;

ApiTest.get(
  '/hello'
  , (v) =>
      Check.typ.string(v)
      && v === 'hello'
  , 'Get hello message from server'
  , 'STANDARD API'
);

ApiTest.run();
```

then run tests with

```
node any.js --help

Usage: any [options] <url>

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
```
