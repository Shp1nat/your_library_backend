const {DataTypes} = require('sequelize');

module.exports.step = 4;

module.exports.updateVector = async (inParams) => {
};

module.exports.createModel = (inParams) => {
    const {connection} = inParams;
    const {model} = inParams;

    const sequelize = connection.sequelize;

    const Order = sequelize.define('Order', {
        status: {
            type: DataTypes.STRING,
        },
        userComment: {
            type: DataTypes.INTEGER
        }
    }, {
        paranoid: true
    });

    const {Example, User} = model;

    Example.hasMany(Order, {foreignKey: 'exampleId'});
    Order.belongsTo(Example, {foreignKey: 'exampleId'});

    User.hasMany(Order, {foreignKey: 'userId'});
    Order.belongsTo(User, {foreignKey: 'userId'});

    return {
        Order
    };
};
