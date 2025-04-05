const {DataTypes} = require('sequelize');

module.exports.step = 1;

module.exports.updateVector = async (inParams) => {
};

module.exports.createModel = (inParams) => {
    const {connection} = inParams;

    const sequelize = connection.sequelize;

    const City = sequelize.define('City', {
        name: {
            type: DataTypes.STRING,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
        },
        builtIn: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });

    return {
        City
    };
};
