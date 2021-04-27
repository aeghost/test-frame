const ApiTest = require('../../index');
const Check = ApiTest.check;

ApiTest.get(
  "/hello",
  (v) =>
    Check.typ.string(v)
    && Check.typ.includes(v, 'hello'),
  "Get hello message, laxist test",
  'STANDARD API'
);

ApiTest.get(
  "/hello",
  (v) =>
    v === 'hello',
  "Get hello message, strong validation",
  'STANDARD API'
);

Check.success = v => !!v['result'] && v.result === 'success';

ApiTest.testFor(['1', '2', '3'], s => {
  ApiTest.get(
    `add/user/foo_${s}`,
    Check.success,
    "Add user, validate operation",
    'USER MANAGEMENT API'
  );

  ApiTest.get(
    `/user/${s}`,
    v =>
      Check.success(v)
      && Check.fields(v, ['result', 'datas'])
      && Check.fields(v.datas, ['name'])
      && Check.typ.string(v.datas.name)
      && v.datas.name.includes('foo'),
    "Get user, rigourous validation",
    'USER MANAGEMENT API'
  );
});

ApiTest.run();