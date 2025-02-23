const {DataTypes} = require('sequelize');
const crypto = require("crypto-js");

module.exports.step = 1;

module.exports.updateVector = async (inParams) => {
};

module.exports.createModel = (inParams) => {
    const {connection} = inParams;
    // const {model} = inParams;

    const sequelize = connection.sequelize;

    const User = sequelize.define('User', {
        login: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            set (value) {
                this.setDataValue('password', crypto.SHA256(value).toString());
            }
        },
        email: {
            type: DataTypes.STRING
        },
        name: {
            type: DataTypes.STRING
        },
        surname: {
            type: DataTypes.STRING
        },
        age: {
            type: DataTypes.INTEGER
        }
    }, {
        paranoid: true
    });

    // const {Entity, entityCreateHook, entityBulkCreateHook, connectModelToTag, connectModelToUpdater, Rule, App, ruleCondition, linkTableToChanges} = model;
    //
    // const Rule_Service = sequelize.define('Rule_Service', {}, {});
    //
    // Rule.belongsToMany(Service, { through: Rule_Service });
    // Service.belongsToMany(Rule, { through: Rule_Service });
    //
    // Service.hasMany(App, {foreignKey: 'serviceId'});
    // App.belongsTo(Service, {foreignKey: 'serviceId'});
    //
    // Entity.hasOne(Service, {foreignKey: 'entityId'});
    // Service.belongsTo(Entity, {foreignKey: 'entityId'});
    //
    // Service.addHook('beforeCreate', 'entityServiceHook', entityCreateHook);
    // Service.addHook('beforeBulkCreate', 'entityServiceBulkHook', entityBulkCreateHook);
    //
    // connectModelToUpdater(Service);
    //
    // connectModelToTag(Service, true);
    //
    // ruleCondition(Service);
    //
    // linkTableToChanges(Service, true);

    return {
        User
    };
};
