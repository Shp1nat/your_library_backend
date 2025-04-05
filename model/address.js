const {DataTypes} = require('sequelize');

module.exports.step = 2;

module.exports.updateVector = async (inParams) => {
};

module.exports.createModel = (inParams) => {
    const {connection} = inParams;
    const {model} = inParams;

    const sequelize = connection.sequelize;

    const Address = sequelize.define('Address', {
        house: {
            type: DataTypes.STRING
        },
        floor: {
            type: DataTypes.INTEGER
        },
        apartNum: {
            type: DataTypes.INTEGER
        },
        builtIn: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        paranoid: true
    });

    const {City, Street, Publisher, User} = model;

    City.hasMany(Address, { as: 'addresses', foreignKey: 'cityId' });
    Address.belongsTo(City, { as: 'city', foreignKey: 'cityId' });
    Street.hasMany(Address, { as: 'addresses', foreignKey: 'streetId' });
    Address.belongsTo(Street, { as: 'street', foreignKey: 'streetId' });

    const Address_Publisher = sequelize.define('Address_Publisher', {}, {});

    Publisher.belongsToMany(Address, { as: 'addresses', through: Address_Publisher });
    Address.belongsToMany(Publisher, { as: 'publishers', through: Address_Publisher });

    const Address_User = sequelize.define('Address_User', {}, {});

    User.belongsToMany(Address, { as: 'addresses', through: Address_User });
    Address.belongsToMany(User, { as: 'users', through: Address_User });

    return {
        Address,
        Address_Publisher,
        Address_User
    };
};
