const express = require('express')
const Log = require('../../../src/logger');
const app = express()

class MiniServer {
  port = 4200
  users = []

  constructor() { }

  api() {
    app.get('/hello', (_, res) => {
      res.send("hello");
    });


    app.get('/add/user/:name', (req, res) => {
      const name = req.params.name;
      Log.log(`Asked /add/user/${name}`);
      try {
        this.users.push(name);

        res.send({
          result: 'success',
          added: name
        });

      } catch (e) {
        res.send({
          result: 'failed',
          error: e
        });
        Log.error('get', '/add/user/:name', e);
      }
    });

    app.get('/user/:pos', (req, res) => {
      const pos = parseInt(req.params.pos);
      Log.log(`Asked /user/${pos}`);
      try {
        const name = this.users[pos];

        res.send({
          result: 'success',
          datas: { name: name }
        });

      } catch (e) {
        res.send({
          result: 'failed',
          error: e
        });
        Log.error('get', '/user/:pos', e);
      }
    });

    app.post('/post/user', (req, res) => {
      const payload = req.body;
      Log.log(`POST /post/user/ with ${JSON.stringify(payload)}`);
      try {
        if (!!payload['name']) {
          res.send({
            result: 'success',
            datas: { name: payload.name }
          });
        } else {
          res.send({
            result: 'failed',
            error: 'No_name_given',
            wanted: { name: 'string' },
            given: payload
          });
        }
      } catch (e) {
        res.send({
          result: 'failed',
          error: e,
          wanted: { name: 'string' },
          given: payload
        });
        Log.error('post', '/post/user', e);
      }
    });
  }

  run() {
    app.listen(this.port, () => {
      Log.title(`Server is running at ${this.port}`);
    });
  }

}

const server = new MiniServer();
server.api();
server.run();
