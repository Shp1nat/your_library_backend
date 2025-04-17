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

    Example.hasMany(Order, { as: 'orders', foreignKey: 'exampleId' });
    Order.belongsTo(Example, { as: 'example', foreignKey: 'exampleId'});

    User.hasMany(Order, { as: 'orders', foreignKey: 'userId'});
    Order.belongsTo(User, { as: 'user', foreignKey: 'userId'});

    return {
        Order
    };
};
