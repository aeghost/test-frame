const _colors = require("colors");

class Print {
  test_num = 0;
  total = 0;
  errorsList = [];
  verbose = true;
  verboseError = true;
  sepString = "--------------------------------------------------------------------------------".gray

  stringify = (s) => {
    // console.log(s);
    try {
      return JSON.stringify(s, null, 2);
    } catch (_) {
      return s.toString();
    }
  };

  sep = () =>
    this.log(this.sepString);

  title = (title) => {
    this.log("");
    this.sep();
    this.log(title.cyan.bold);
    this.sep();
    this.log("");
  };

  group = (gr) => {
    this.log("");
    // this.sep();
    this.log(gr.toUpperCase().yellow.bold);
    this.sep();
    this.log("");
  };

  undefined = (prot, s, error) => {
    this.log(
      "CATCH ERROR".yellow.bold,
      " | ".gray,
      `${prot.toUpperCase()}`.bold,
      " | ".gray,
      s.bold,
      ` | ${error}`.bold
    );
  };

  ok = (prot, s, data) => {
    this.log(
      "  OK ".bold.green,
      " | ".gray,
      `${prot.toUpperCase()}`.bold,
      " | ".gray,
      s.bold,
      this.verbose ? ` | ${this.stringify(data)}` : ""
    );
  };

  error = (prot, s, data) => {
    this.err(
      "ERROR".bold.red,
      " | ".gray,
      `${prot.toUpperCase()}`.bold,
      " | ".gray,
      s.bold,
      this.verboseError ? ` | ${this.stringify(data)}` : ""
    );
  };

  num = () => this.log(`Progress : ${this.test_num}/${this.total}`);

  errors = () => {
    this.sep();
    if (this.errorsList.length > 0) {
      this.title("FAILED TESTS");
      for (const e of this.errorsList) {
        if (e.errors === "failed") {
          this.err(
            e.descr.red,
            " | ".gray,
            `${e.prot.toUpperCase()}`.bold,
            " | ".gray,
            e.addr.red.bold,
            this.verboseError ? ` | ${this.stringify(e.response)}` : ""
          );
        } else {
          this.err(
            e.descr.yellow,
            " | ".gray,
            `${e.prot.toUpperCase()}`.bold,
            " | ".gray,
            e.addr.yellow.bold,
            this.verboseError ? ` | ${this.stringify(e.response)}` : ""
          );
        }
      }
    } else {
      this.title("ALL GOOD");
    }
  };

  descr = (descr) => {
    ++this.test_num;
    this.num();
    if (!!descr) {
      this.log(`${descr.cyan}\n`);
    }
  };

  any = console.log;
  log = console.log;
  err = console.log;
  debug = console.debug;
}

module.exports = new Print();