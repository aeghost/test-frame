const program = require("commander");
const Log = require("./logger");

class GlobalConf {
  knownTyp = {
    path: 'path',
    bool: 'bool',
    int: 'integer',
    float: 'float',
    string: 'string',
    name: v => v,
    bounds: (m, M, typ = 'integer') => `[${m}; ${M}] as ${typ}`
  }

  conf = {}

  addParams(name, descr = "New Param", defaultValue, shortName = '', typ = name) {
    this.conf[name] = { defaultValue, descr, typ, name, shortName, definedValue: defaultValue };
  }

  mainName = 'main';
  program = undefined;

  constructor(mainName, mainDescr, mainDefaultValue, mainShortName, mainTyp) {
    this.mainName = mainName;
    this.conf[mainName] = {
      name: mainName,
      defaultValue: mainDefaultValue,
      descr: mainDescr,
      typ: mainTyp,
      shortName: mainShortName,
      definedValue: mainDefaultValue
    };
    this.program = program;
  }

  run() {
    const name = this.mainName;

    program
      .arguments(`<${this.conf[name].typ}>`);

    const values = Object.values(this.conf);
    const keys = Object.keys(this.conf);
    const conf = {};

    for (const e of values) {
      if (e.name !== name)
        program.option(`-${e.shortName}, --${e.name} <${e.typ}>`, '' + e.descr);
    }

    program.action(function (main) {

      // if (!!conf) {
      for (const e of keys) {
        if (program[e] !== undefined) {
          conf[e] = program[e];
        }
      }

      conf[name] = main;

      // console.log(conf);

      // this.conf = conf;
      // }
    })
      .parse(process.argv);

    for (const e of Object.keys(conf)) {
      this.conf[e].definedValue = conf[e];
    }

    Log.title("USED CONFIGURATION");
    Log.log(Object.values(this.conf).map(e => ({ [e.name]: e.definedValue })));
    Log.log("");
  }
}

module.exports = GlobalConf