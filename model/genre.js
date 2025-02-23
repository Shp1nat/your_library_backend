const {DataTypes} = require('sequelize');

module.exports.step = 1;

module.exports.updateVector = async (inParams) => {
};

module.exports.createModel = (inParams) => {
    const {connection} = inParams;

    const sequelize = connection.sequelize;

    const Genre = sequelize.define('Genre', {
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
        Genre
    };
};
