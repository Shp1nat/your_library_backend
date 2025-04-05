const {DataTypes} = require('sequelize');

module.exports.step = 1;

module.exports.updateVector = async (inParams) => {
};

module.exports.createModel = (inParams) => {
    const {connection} = inParams;
    const {model} = inParams;

    const sequelize = connection.sequelize;

    const Street = sequelize.define('Street', {
        name: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT,
        },
        builtIn: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });

    const {City} = model;

    City.hasMany(Street, { as: 'street', foreignKey: 'cityId' });
    Street.belongsTo(City, { as: 'city', foreignKey: 'cityId' });

    return {
        Street
    };
};
