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
            type: DataTypes.STRING
        },
        finishDate: {
            type: DataTypes.DATE
        }
    }, {
        paranoid: true
    });

    const {Example, User} = model;

    const Order_Example = sequelize.define('Order_Example', {}, {});

    Order.belongsToMany(Example, { as: 'examples', through: Order_Example });
    Example.belongsToMany(Order, { as: 'orders', through: Order_Example });

    User.hasMany(Order, { as: 'orders', foreignKey: 'userId'});
    Order.belongsTo(User, { as: 'user', foreignKey: 'userId'});

    return {
        Order,
        Order_Example
    };
};
