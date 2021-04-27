const Conf = require('./src/configurator');
const Log = require("./src/logger");
const axios = require("axios");
const https = require("https");
const fs = require("fs");
const _TestFrame = require("./src/tester");

const Configurate = new Conf(
  'url', 'URL to send POST/GET messages'
  , 'http://127.0.0.1:8080/rest', 'u', 'url'
);

class TestFrame {

  Frame = undefined;
  run = undefined;

  configure() {

    Configurate.addParams(
      'selfSigned', 'Accept Self Signed Certificate'
      , true, 'ss', Configurate.knownTyp.bool
    );

    Configurate.addParams(
      'useAuthorityOnly', 'Use only authority file'
      , false, 'ucao', Configurate.knownTyp.bool
    );
    Configurate.addParams(
      'authority', 'Path to certificate authority file'
      , './ca', 'ca', Configurate.knownTyp.path
    );
    Configurate.addParams(
      'certificate', 'Path to certificate file'
      , './cert', 'cert', Configurate.knownTyp.path
    );
    Configurate.addParams(
      'privateKey', 'Path to the associate private key file'
      , './private', 'pk', Configurate.knownTyp.path
    );

    Configurate.addParams(
      'usePkcs12', 'Use P12 file'
      , false, 'up12', Configurate.knownTyp.bool
    );
    Configurate.addParams(
      'pkcs12', 'Path to the associate P12 file'
      , './p12', 'p12', Configurate.knownTyp.path
    );
    Configurate.addParams(
      'pkcs12Password', 'Password associated with the P12 file'
      , '', 'p12pw', Configurate.knownTyp.string
    );

    Configurate.addParams(
      'useHttps', 'Should use HTTPS instead of HTTP'
      , false, 'https', Configurate.knownTyp.bool
    );
    Configurate.addParams(
      'verboseResponse', 'Should print server responses'
      , false, 'vr', Configurate.knownTyp.bool
    );
    Configurate.addParams(
      'verboseError', 'Should print server errors responses'
      , false, 'vr', Configurate.knownTyp.bool
    );

    Configurate.addParams(
      'await', 'Set an await time between requests'
      , 300, 'a', Configurate.knownTyp.bounds(1, 360000)
    );

    Configurate.addParams(
      'matching', 'Execute tests matching given string'
      , '', 'm', Configurate.knownTyp.string
    );
    Configurate.addParams(
      'productName', 'Execute parametered product named tests'
      , 'ANY', 'pn', Configurate.knownTyp.string
    );

    Configurate.run();
  }

  constructor() {
    this.configure();
    if (!!Configurate.conf.selfSigned.definedValue) process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    Log.verbose = !!Configurate.conf.verboseResponse.definedValue;
    Log.verboseError = !!Configurate.conf.verboseError.definedValue;

    let webConnectorConfiguration;
    if (!!Configurate.conf.useHttps.definedValue) {
      if (!!Configurate.conf.usePkcs12.definedValue) {
        webConnectorConfiguration = {
          baseURL: `${Configurate.conf.url.definedValue}`,
          httpsAgent: new https.Agent({
            pfx: fs.readFileSync(`${Configurate.conf.pkcs12.definedValue}`),
            passphrase: Configurate.conf.pkcs12Password.definedValue,
            rejectUnauthorized: false,
          }),
        };
      } else {
        let httpsParams = {};
        if (!!conf.useAuthorityOnly.definedValue) {
          httpsParams = {
            ca: fs.readFileSync(`${Configurate.conf.authority.definedValue}`),
            rejectUnauthorized: false,
          }
        } else {
          httpsParams = {
            ca: fs.readFileSync(`${Configurate.conf.authority.definedValue}`),
            cert: fs.readFileSync(`${Configurate.conf.certificate.definedValue}`),
            key: fs.readFileSync(`${Configurate.conf.privateKey.definedValue}`),
            rejectUnauthorized: false,
          }
        }
        webConnectorConfiguration = {
          baseURL: `${Configurate.conf.url.definedValue}`,
          httpsAgent: new https.Agent(httpsParams),
        };
      }
    } else {
      webConnectorConfiguration = {
        baseURL: `${Configurate.conf.url.definedValue}`,
      };
    }

    const webConnector = axios.create(webConnectorConfiguration);

    this.Frame = new _TestFrame(webConnector, (() => {
      try {
        return parseInt(Configurate.conf.await.definedValue);
      } catch (e) {
        console.error(e);
        return 300;
      }
    })());
    this.Frame.only = Configurate.conf.matching.definedValue;

    this.run = this.Frame.run;
  }
}

const Frame = new TestFrame();

module.exports = {
  add: Frame.Frame.add,
  get: Frame.Frame.get,
  post: Frame.Frame.post,
  testFor: Frame.Frame.apply,
  frame: Frame.Frame,
  check: Frame.Frame.check,
  run: Frame.run
};
