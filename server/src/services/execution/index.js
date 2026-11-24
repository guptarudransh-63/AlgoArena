const config = require('../../config');
const Judge0Adapter = require('./Judge0Adapter');
const MockAdapter = require('./MockAdapter');

let instance = null;

function getExecutionService() {
  if (!instance) {
    if (config.executionProvider === 'judge0') {
      instance = new Judge0Adapter();
    } else {
      instance = new MockAdapter();
    }
  }
  return instance;
}

module.exports = {
  getExecutionService,
  Judge0Adapter,
  MockAdapter
};
