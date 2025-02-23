const {DataTypes} = require('sequelize');

module.exports.step = 3;

module.exports.updateVector = async (inParams) => {
};

module.exports.createModel = (inParams) => {
    const {connection} = inParams;
    const {model} = inParams;

    const sequelize = connection.sequelize;

    const Example = sequelize.define('Example', {
        description: {
            type: DataTypes.TEXT,
        },
        year: {
            type: DataTypes.INTEGER
        },
        count: {
            type: DataTypes.INTEGER
        }
    }, {
        paranoid: true
    });

    const {Publisher, Book} = model;

    Publisher.hasMany(Example, {foreignKey: 'publisherId'});
    Example.belongsTo(Publisher, {foreignKey: 'publisherId'});

    Book.hasMany(Example, {foreignKey: 'bookId'});
    Example.belongsTo(Book, {foreignKey: 'bookId'});

    return {
        Example
    };
};
