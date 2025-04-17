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
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        paranoid: true
    });

    const {Author, Genre, Type} = model;

    const Book_Author = sequelize.define('Book_Author', {}, {});

    Book.belongsToMany(Author, { as: 'authors', through: Book_Author });
    Author.belongsToMany(Book, { as: 'books', through: Book_Author });

    const Book_Genre = sequelize.define('Book_Genre', {}, {});

    Book.belongsToMany(Genre, { as: 'genres', through: Book_Genre });
    Genre.belongsToMany(Book, { as: 'books', through: Book_Genre });

    const Book_Type = sequelize.define('Book_Type', {}, {});

    Book.belongsToMany(Type, { as: 'types', through: Book_Type });
    Type.belongsToMany(Book, { as: 'books', through: Book_Type });

    return {
        Book,
        Book_Author,
        Book_Genre,
        Book_Type
    };
};
