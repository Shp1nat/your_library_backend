const {DataTypes} = require('sequelize');

module.exports.step = 2;

module.exports.updateVector = async (inParams) => {
};

module.exports.createModel = (inParams) => {
    const {connection} = inParams;
    const {model} = inParams;

    const sequelize = connection.sequelize;

    const Book = sequelize.define('Book', {
        name: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT,
        },
        year: {
            type: DataTypes.INTEGER
        },
        digitalVersion: {
            type: DataTypes.BOOLEAN
        }
    }, {
        paranoid: true
    });

    const {Author, Genre, Type} = model;

    const Book_Author = sequelize.define('Book_Author', {}, {});

    Book.belongsToMany(Author, { through: Book_Author });
    Author.belongsToMany(Book, { through: Book_Author });

    const Book_Genre = sequelize.define('Book_Genre', {}, {});

    Book.belongsToMany(Genre, { through: Book_Genre });
    Genre.belongsToMany(Book, { through: Book_Genre });

    const Book_Type = sequelize.define('Book_Type', {}, {});

    Book.belongsToMany(Type, { through: Book_Type });
    Type.belongsToMany(Book, { through: Book_Type });

    return {
        Book,
        Book_Author,
        Book_Genre,
        Book_Type
    };
};
