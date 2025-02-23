const {DataTypes} = require('sequelize');
const crypto = require("crypto-js");

module.exports.step = 1;

module.exports.updateVector = async (inParams) => {
};

module.exports.createModel = (inParams) => {
    const {connection} = inParams;
    const {model} = inParams;

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
        lastname: {
            type: DataTypes.STRING
        },
        patronymic: {
            type: DataTypes.STRING
        },
        age: {
            type: DataTypes.INTEGER
        },
        address: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'user'
        }
    }, {
        paranoid: true
    });

    const {Address} = model;

    return {
        User
    };
};
