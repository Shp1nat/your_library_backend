const {DataTypes} = require('sequelize');

module.exports.step = 3;

module.exports.updateVector = async (inParams) => {
};

module.exports.createModel = (inParams) => {
    const {connection} = inParams;
    const {model} = inParams;

    const sequelize = connection.sequelize;

    const Example = sequelize.define('Example', {
        name: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        availableCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        digitalVersion: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        picture: {
            type: DataTypes.BLOB('long'),
            allowNull: true
        }
    }, {
        paranoid: true
    });

    const {Publisher, Book} = model;

    Publisher.hasMany(Example, { as: 'examples', foreignKey: 'publisherId' });
    Example.belongsTo(Publisher, { as: 'publisher', foreignKey: 'publisherId' });

    Book.hasMany(Example, {as: 'examples', foreignKey: 'bookId'});
    Example.belongsTo(Book, { as: 'book', foreignKey: 'bookId' });

    return {
        Example
    };
};
