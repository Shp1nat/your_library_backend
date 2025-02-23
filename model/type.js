const {DataTypes} = require('sequelize');

module.exports.step = 1;

module.exports.updateVector = async (inParams) => {
};

module.exports.createModel = (inParams) => {
    const {connection} = inParams;

    const sequelize = connection.sequelize;

    const Type = sequelize.define('Type', {
        name: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT,
        }
    }, {
        paranoid: true
    });

    return {
        Type
    };
};
