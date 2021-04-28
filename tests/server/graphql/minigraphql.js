const { graphql, buildSchema } = require('graphql');
const Log = require('../../../src/logger');

const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

var root = {
  hello: () => 'hello',
};

graphql(schema, '{ hello }', root).then((response) => {
  Log.log(`Asked /hello`);
});