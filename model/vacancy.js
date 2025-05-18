const {DataTypes} = require('sequelize');

module.exports.step = 2;

module.exports.updateVector = async (inParams) => {
};

module.exports.createModel = (inParams) => {
    const {connection} = inParams;
    const {model} = inParams;

    const sequelize = connection.sequelize;

    const Vacancy = sequelize.define('Vacancy', {
        text: {
            type: DataTypes.TEXT
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'waiting'
        }
    }, {
        paranoid: true
    });

    const {User} = model;

    User.hasMany(Vacancy, {as: 'vacancies', foreignKey: 'userId'});
    Vacancy.belongsTo(User, {as: 'user', foreignKey: 'userId'});


    return {
        Vacancy
    };
};
