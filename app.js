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
const authRoles = require('./authRoles');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const cron = require('node-cron');
const checkOverdueOrders = require('./cron/checkOverdueOrders');

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
            this.initCronJobs.bind(this),
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

    initCronJobs(inParams, onDone) {
        try {
            cron.schedule('0 0 * * *', () => {
                checkOverdueOrders(this).then();
            }, {
                timezone: 'Europe/Moscow'
            });

            console.log('Cron jobs scheduled');
            return onDone();
        } catch (err) {
            console.error('Error scheduling cron job:', err);
            return onDone(err);
        }
    }

    initRoutes (inParams, onDone) {
        this.initUserRoutes();
        this.initSimpleRoutes();
        this.initOrderRoutes();
        this.initVacancyRoutes();

        return onDone();
    }

    initUserRoutes () {
        //todo simplify
        const refreshTokenRoute = require('./commands/user/refresh-token')(this.express, this.model);
        this.express.post('/users/refresh-token', refreshTokenRoute);

        const noAuthHandlers = ['sign-up-user', 'sign-in-user'];
        for (const handler of noAuthHandlers) {
            const ref = require(`./commands/user/${handler}`);
            this.express.post(ref.url, (new ref(this)).execute);
        }

        const authHandlers = ['set-user', 'get-user-info', 'update-profile'];
        const adminHandlers = ['get-user-ids-out', 'get-user-ids'];
        const accessHandlersMap = new Map()
            .set(['user', 'admin'], authHandlers)
            .set(['admin'], adminHandlers)

        for (const [access, handlers] of accessHandlersMap) {
            for (const handler of handlers) {
                const ref = require(`./commands/user/${handler}`);
                if (handler !== 'update-profile')
                    this.express.post(ref.url, authMiddleware, authRoles(...access), (new ref(this)).execute);
                else
                    this.express.post(ref.url, authMiddleware, authRoles(...access), upload.single('avatar'), (new ref(this)).execute);
            }
        }
    }

    initSimpleRoutes () {
        //todo simplify
        const commands = ['address', 'author', 'book', 'city', 'example', 'genre', 'publisher', 'street', 'type'];
        for (const command of commands) {
            const authHandlers = [`get-${command}-ids`, `get-${command}-ids-out`];
            const adminHandlers = [`set-${command}`, `remove-${command}`];
            const accessHandlersMap = new Map()
                .set(['user', 'admin'], authHandlers)
                .set(['admin'], adminHandlers)

            for (const [access, handlers] of accessHandlersMap) {
                for (const handler of handlers) {
                    const ref = require(`./commands/${command}/${handler}`);
                    this.express.post(ref.url, authMiddleware, authRoles(...access), (new ref(this)).execute);
                }
            }
        }
    }

    initOrderRoutes () {
        //todo simplify
        const authHandlers = [`get-user-order-ids`, `get-user-order-ids-out`, 'make-order'];
        const adminHandlers = [`get-order-ids`, `get-order-ids-out`, `remove-order`, 'close-order', 'approve-order-rent', 'reject-order-rent'];
        const accessHandlersMap = new Map()
            .set(['user', 'admin'], authHandlers)
            .set(['admin'], adminHandlers)

        for (const [access, handlers] of accessHandlersMap) {
            for (const handler of handlers) {
                const ref = require(`./commands/order/${handler}`);
                this.express.post(ref.url, authMiddleware, authRoles(...access), (new ref(this)).execute);
            }
        }
    }

    initVacancyRoutes () {
        //todo simplify
        const authHandlers = [`get-user-vacancy-ids`, `get-user-vacancy-ids-out`, 'make-vacancy'];
        const adminHandlers = [`get-vacancy-ids`, `get-vacancy-ids-out`, `remove-vacancy`, 'accept-vacancy', 'reject-vacancy'];
        const accessHandlersMap = new Map()
            .set(['user', 'admin'], authHandlers)
            .set(['admin'], adminHandlers)

        for (const [access, handlers] of accessHandlersMap) {
            for (const handler of handlers) {
                const ref = require(`./commands/vacancy/${handler}`);
                this.express.post(ref.url, authMiddleware, authRoles(...access), (new ref(this)).execute);
            }
        }
    }

    initBuiltInAddresses (inParams, onDone) {
        const importer = new addressImporter(inParams.app);
        importer.execute().then(res => {return onDone();})
    }
}

module.exports = Application;
