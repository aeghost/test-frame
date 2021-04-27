const ApiTest = require('../../index');

ApiTest.get(
  "/hello",
  (v) =>
    Frame.check.typ.string(v) && Frame.check.includes(v, 'hello'),
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

ApiTest.check.success = v => !!v['result'] && v.result === 'success';

ApiTest.testFor(['1', '2', '3'], s => {
  ApiTest.get(
    `add/user/foo_${s}`,
    ApiTest.check.success,
    "Add user, validate operation",
    'USER MANAGEMENT API'
  );

  ApiTest.get(
    `/user/${s}`,
    v =>
      ApiTest.check.success(v)
      && ApiTest.check.fields(v, ['result', 'datas'])
      && ApiTest.check.fields(v.datas, ['name'])
      && ApiTest.check.typ.string(v.datas.name)
      && v.datas.name === 'foo',
    "Get user, rigourous validation",
    'USER MANAGEMENT API'
  );
});

ApiTest.run();