const model = require('./model');

class Application {
    prepare (inParams, onDone) {
        inParams.app = this;
    }

    start (inParams, onDone) {
    }
}

module.exports = Application;
