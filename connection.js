const { Sequelize } = require('sequelize');

class Connection {
    getOptions (inParams) {
        return {
            logging: false,
            pool: {
                idle: 60000
            }
        };
    }

    init (inParams, onDone) {
        const dbInfo = {server: 'localhost', pwd: 'poi1lkj2MM', user: 'postgres', database: 'yourlibrary'};

        const defaults = {
            'type': 'pg',
            'server': dbInfo.server,
            'user_type': 0,
            'pwd': dbInfo.pwd,
            'user': dbInfo.user,
            'database': dbInfo.database
        };
        const {settings = defaults} = inParams;
        this._settings = settings;
        var sequelize = new Sequelize(`postgres://${settings.user}:${settings.pwd}@${settings.server}/${settings.database}`, this.getOptions(inParams));

        return this.update(inParams, (err) => {
            if (err)
                return onDone(err);

            this._sequelize = sequelize;
            return onDone();
        });
    }

    get settings () {
        return this._settings;
    }
    get sequelize () {
        return this._sequelize;
    }

    update (inparams, onDone) {
        return onDone();
    }
};

module.exports = Connection;
