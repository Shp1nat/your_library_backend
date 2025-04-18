const async = require('async');
const model = require('./model');
const Connection = require('./connection');
const express = require('express');
const cors = require('cors');
const fsp = require('fs/promises');
const path  = require('path');
const {commandsPath, builtInAddressPath} = require('./depends.js');
const addressImporter = require(path.join(builtInAddressPath, 'addressImporter.js'));
const authMiddleware = require('./authMiddleware');

class Application {
    constructor () {
        this.express = express();
        this.express.use(express.json());
        this.express.use(cors({
            origin: 'http://localhost:8080',
            credentials: true
        }));
    }

    prepare (inParams, onDone) {
        inParams.app = this;
        let tasks = [
            this.initModel.bind(this),
            this.initRoutes.bind(this),
            this.initBuiltInAddresses.bind(this)
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
        this.initUserRoutes();
        this.initSimpleRoutes();

        return onDone();
    }

    initUserRoutes () {
        //todo simplify
        const getUserInfo = require('./commands/user/get-user-info')(this.express, this.model);
        const refreshTokenRoute = require('./commands/user/refresh-token')(this.express, this.model);
        this.express.post('/users/refresh-token', refreshTokenRoute);
        this.express.get('/users/me', authMiddleware, getUserInfo);

        const handlers = ['sign-up-user', 'sign-in-user'];
        for (const handler of handlers) {
            const ref = require(`./commands/user/${handler}`);
            this.express.post(ref.url, (new ref(this)).execute);
        }
    }

    initSimpleRoutes () {
        //todo simplify
        const commands = ['address', 'author', 'book', 'city', 'example', 'genre', 'publisher', 'street', 'type'];
        for (const command of commands) {
            const handlers = [`set-${command}`, `get-${command}-ids`, `get-${command}-ids-out`, `remove-${command}`];
            for (const handler of handlers) {
                const ref = require(`./commands/${command}/${handler}`);
                this.express.post(ref.url, (new ref(this)).execute);
            }
        }
    }

    initBuiltInAddresses (inParams, onDone) {
        const importer = new addressImporter(inParams.app);
        importer.execute().then(res => {return onDone();})
    }
}

module.exports = Application;
