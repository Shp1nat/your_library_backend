const async = require('async');
const model = require('./model');
const Connection = require('./connection');
const express = require('express');
const authMiddleware = require('./authMiddleware');

class Application {
    constructor () {
        this.express = express();
        this.express.use(express.json());
    }

    prepare (inParams, onDone) {
        inParams.app = this;
        let tasks = [
            this.initModel.bind(this),
            this.initRoutes.bind(this)
        ];

        async.eachSeries(tasks, (task, taskDone) => {
            console.log(`${task.name} is start!`);
            return task(inParams, (err) => {
                console.log(`${task.name} is finish!`);
                if (err) {
                    console.error(`Error on ${task.name}: ${err}`);
                    return taskDone();
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
        this.express.listen(3000, () => { // порт сервера
            console.log('Server is running on port 3000');
            onDone();
        });
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

    initRoutes (inParams, onDone) {
        const registrateUser = require('./commands/user/registrate-user')(this.express, this.model);
        const getUserInfo = require('./commands/user/get-user-info')(this.express, this.model);
        const enterUser = require('./commands/user/enter-user')(this.express, this.model);
        const refreshTokenRoute = require('./commands/user/refresh-token')(this.express, this.model);

        this.express.post('/users/refresh-token', refreshTokenRoute);
        this.express.post('/users/login', enterUser);
        this.express.post('/users/register', registrateUser);
        this.express.get('/users/me', authMiddleware, getUserInfo);

        return onDone();
    }
}

module.exports = Application;
