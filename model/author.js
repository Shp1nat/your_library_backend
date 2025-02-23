const {DataTypes} = require('sequelize');

module.exports.step = 1;

module.exports.updateVector = async (inParams) => {
};

module.exports.createModel = (inParams) => {
    const {connection} = inParams;

    const sequelize = connection.sequelize;

    const Author = sequelize.define('Author', {
        name: {
            type: DataTypes.STRING
        },
        lastname: {
            type: DataTypes.STRING
        },
        patronymic: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT,
        }
    }, {
        paranoid: true
    });

    return {
        Author
    };
};
