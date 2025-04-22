const {DataTypes} = require('sequelize');
const bcrypt = require('bcrypt');

module.exports.step = 1;

module.exports.updateVector = async (inParams) => {
};

module.exports.createModel = (inParams) => {
    const {connection} = inParams;

    const sequelize = connection.sequelize;

    const User = sequelize.define('User', {
        login: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            set(value) {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(value, salt);
                this.setDataValue('password', hash);
            }
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
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
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'user'
        },
        picture: {
            type: DataTypes.BLOB('long'),
            allowNull: true
        }
    }, {
        paranoid: true
    });

    return {
        User
    };
};
