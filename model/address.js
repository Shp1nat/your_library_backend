const {DataTypes} = require('sequelize');

module.exports.step = 2;

module.exports.updateVector = async (inParams) => {
};

module.exports.createModel = (inParams) => {
    const {connection} = inParams;
    const {model} = inParams;

    const sequelize = connection.sequelize;

    const Address = sequelize.define('Address', {
        city: {
            type: DataTypes.STRING
        },
        street: {
            type: DataTypes.STRING
        },
        house: {
            type: DataTypes.STRING
        },
        floor: {
            type: DataTypes.INTEGER
        },
        apartNumber: {
            type: DataTypes.INTEGER
        }
    }, {
        paranoid: true
    });

    const {Publisher, User} = model;

    const Address_Publisher = sequelize.define('Address_Publisher', {}, {});

    Publisher.belongsToMany(Address, { through: Address_Publisher });
    Address.belongsToMany(Publisher, { through: Address_Publisher });

    const Address_User = sequelize.define('Address_User', {}, {});

    User.belongsToMany(Address, { through: Address_User });
    Address.belongsToMany(User, { through: Address_User });

    return {
        Address,
        Address_Publisher,
        Address_User
    };
};
