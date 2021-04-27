/** -------------------------------------------------------------------
 * @Author Matthieu GOSSET <matthieu.gosset@bertin.fr>
 * @Company Bertin-IT
 * @Project [CrossinG-2.2]
 * @Date 2020-06-08 15:01:08
 * @LastModifiedby [MGO]
 * ------------------------------------------------------------------- */
const _sleep = require("sleep");
const Log = require("./logger.js");
const fs = require("fs");

// AUTHORISED SELF-SIGNED CERTS (USUALLY USEFULL FOR HTTPS API TESTS)
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// let httpAxios;
// if (program.authority !== undefined && program.certificate !== undefined) {
//   if (program.pkcs12 !== "") {
//     httpAxios = axios.create({
//       baseURL: `${url}/rest`,
//       httpsAgent: new https.Agent({
//         pfx: fs.readFileSync(`${program.pkcs12}`),
//         passphrase: program.passphrase,
//         rejectUnauthorized: false,
//       }),
//     });
//   } else {
//     httpAxios = axios.create({
//       baseURL: `${url}/rest`,
//       httpsAgent: new https.Agent({
//         ca: fs.readFileSync(`${program.authority}`),
//         cert: fs.readFileSync(`${program.certificate}`),
//         key: fs.readFileSync(`${program.privatekey}`),
//         rejectUnauthorized: false,
//       }),
//     });
//   }
// } else {
//   httpAxios = axios.create({
//     baseURL: `${url}/rest`,
//   });
// }

const wrap = (f) => {
  try {
    return f();
  } catch (_) {
    return false;
  }
};

// const ERRORS = Log.errorsList

class Api {
  content = {};
  timer = 0;
  connector = undefined;
  awaitTime = 300;

  constructor(connector, WAITING_TIME) {
    this.timer = 0;
    this.connector = connector;
    this.awaitTime = WAITING_TIME;
  }

  add = (v, group = "any") => {
    try {
      this.content[group].push(v);
    } catch (_) {
      this.content[group] = [];
      this.content[group].push(v);
    }
  };

  run = (filter = '') => {
    if (filter === '')
      Log.title("AVAILABLE TESTS");
    else
      Log.title("AVAILABLE TESTS MATCHING " + filter.toUpperCase());

    let filtered = [];

    for (const gr of Object.keys(this.content)) {
      if (filter === '' || gr.includes(filter)) {
        Log.group(gr);
        this.content[gr].forEach((element) => {
          ++Log.total;
          Log.log(element.descr.bold.gray);
        });
        filtered.push(gr)
      }
    }

    Log.title("EXECUTING REST TESTS SEQUENCE");

    Log.test_num = 0;

    const _fun = (gr) => {
      this.content[gr].forEach(async (e, i) => {
        setTimeout(async () => {
          if (i === 0) {
          }
          await e.fun();
        }, this.timer);
        this.timer += this.awaitTime;
      });
    };

    for (const gr of Object.keys(this.content)) {
      if (filter === '' || gr.includes(filter)) {
        _fun(gr);
      }
    }

    setTimeout(() => Log.errors(), this.timer + 1000);
  };

  get = (s, check, descr, group) => {
    const obj = {
      descr,
      fun: async () =>
        await this.connector
          .get(s)
          .then(function (response) {
            Log.sep();
            Log.descr(descr);
            // handle success
            if (check !== undefined) {
              if (check(response.data)) {
                // console.log(response.data);
                Log.ok(" get", s, response.data);
                return;
              }
              Log.errorsList.push({
                descr,
                error: "failed",
                prot: " get",
                addr: s,
                response: response.data,
              });
              Log.error(" get", s, response.data);
              return;
            } else {
              Log.ok(" get", s, response.data);
              return;
            }
          })
          .catch(function (error) {
            Log.sep();
            Log.descr(descr);
            Log.errorsList.push({
              descr,
              error: "undefined",
              prot: " get",
              addr: s,
              response: error,
            });
            Log.undefined("get", s, error);
            return;
          }),
    };
    this.add(obj, group);
  }

  post = (s, data, check, descr, group) => {
    const obj = {
      descr,
      fun: async () =>
        await this.connector
          .post(s, data)
          .then(function (response) {
            Log.sep();
            Log.descr(descr);
            if (check !== undefined) {
              if (check(response.data)) {
                Log.ok("post", s, response.data);
                return;
              }
              Log.errorsList.push({
                descr,
                error: "failed",
                prot: "post",
                addr: s,
                response,
              });
              Log.error("post", s, response.data);
            } else {
              Log.ok("post", s, response.data);
              return;
            }
          })
          .catch(function (error) {
            Log.sep();
            Log.descr(descr);
            Log.errorsList.push({
              descr,
              error: "undefined",
              prot: " post",
              addr: s,
              response: error,
            });
            Log.undefined("post", s, error);
          }),
    };
    this.add(obj, group);
  }

}
// let api = new Api();

const identity = v => v;

class ResultValidator {

  f = identity;

  constructor(extractPertinantValueResult = identity) {
    this.f = extractPertinantValueResult;
  }

  list = (v) =>
    wrap(() => typeof this.f(v) === "object" && this.f(v).length !== undefined);

  string = (v) =>
    wrap(() => typeof this.f(v) === "string" && this.f(v).length !== undefined);
  number = (v) => wrap(() => parseFloat(this.f(v)) && this.f(v) !== undefined);
  integer = (v) => wrap(() => parseInt(this.f(v)) && this.f(v) !== undefined);

  matching = (v, s) => wrap(() => typeof this.f(v) === "string" && this.f(v).length !== undefined && this.f(v) === s);
  includes = (v, s) => wrap(() => typeof this.f(v) === "string" && this.f(v).length !== undefined && this.f(v).includes(s));

  anyMatches = (v, s) => wrap(() => typeof this.f(v) === "string" && this.f(v).length !== undefined && Log.stringify(this.f(v)) === s);
  anyIncludes = (v, s) => wrap(() => typeof this.f(v) === "string" && this.f(v).length !== undefined && Log.stringify(this.f(v)).includes(s));

}

class CheckResult {

  typ = undefined;
  success = (v) => !!v;
  error = (v) => !v;

  constructor(checkSuccess = (v) => !!v, checkError = (v) => !v, typValidator = new ResultValidator()) {
    this.success = checkSuccess;
    this.error = checkError;
    this.typ = typValidator;
  }

  // successObj = (v, strict = false) =>
  //   wrap(
  //     () =>
  //       (!!v[successCheckField] && v[successCheckField] === successCheckValue) ||
  //       (!strict && v[successCheckField] === "not_found")
  //   );

  // errorObj = (v) => wrap(() => !!v.result && v.result === "failure");

  validate = (v, f) => wrap(() => v.reduce((acc, v) => acc && f(v), true));

  exists = (v) => this.validate(v, v => v !== undefined);
  fields = (v, sl) => {
    const keys = Object.keys(v);
    this.validade(sl, s => keys.includes(s));
  };
  exactFields = (v, sl) => {
    const keys = Object.keys(v);
    sl === keys;
  }

  existsOrError = (v, src) =>
    wrap(() =>
      wrap(() => v.reduce((acc, v) => acc && v !== undefined, true)) ||
      error(v)
    );

}

class TestFrame {
  only = '';
  api = undefined;
  add = undefined;
  get = undefined;
  post = undefined;
  check = undefined;
  run = undefined;
  log = Log;

  run = () => this.api.run(this.only);


  constructor(connector, awaitTime = 300, resultChecker = new CheckResult()) {
    this.api = new Api(connector, awaitTime);
    this.add = this.api.add;
    this.get = this.api.get;
    this.post = this.api.post;
    this.run = this.api.run;

    this.check = resultChecker;
  }

  generators = {};
  files = {};

  addGenerators = (descr, f) => {
    this.generators[descr] = f;
  }

  addFiles = (descr, path) => {
    let c = fs.readFileSync(path);
    this.files[descr] = c;
  }

  apply = (sl, f) => {
    sl.forEach((s) => f(s));
  }
}

module.exports = TestFrame;
