const async = require('async');
const model = require('./model');
const Connection = require('./connection');

class Application {
    prepare (inParams, onDone) {
        inParams.app = this;
        let tasks = [
            this.initModel.bind(this),
        ]

        async.eachSeries(tasks, (task, taskDone) => {
            console.log(`${task.name} is start!`);
            return task(inParams, (err) => {
                console.log(`${task.name} is finish!`);
                if (err) {
                    console.error(`Error on ${task.name}: ${err}`);
                    return taskDone(); // err);
                }
                return taskDone();
            });
        }, (err) => {
            if (err)
                return onDone(err);
            console.log('prepare all tasks done is success');
            return onDone();
        });
    }

    start (inParams, onDone) {
    }

    initModel (inParams, onDone) {
        this.connection = new Connection();
        this.connection.init(inParams, (err) => {
            if (err)
                return onDone(err);
            return model.createModel(inParams, (err, res) => {
                this.model = res;
                if (err !== null) {
                    console.log(err);
                    return onDone(err);
                }
                return onDone();
            });
        });
    }
}

module.exports = Application;
