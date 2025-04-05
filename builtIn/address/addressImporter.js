const fsp = require('fs/promises');
const path  = require('path');

class addressImporter {
    constructor(app) {
        this.app = app;
        this.model = app?.model;
        this.sequelize = app?.connection?.sequelize;
        this.execute = this.execute.bind(this);
    }

    get cityStreetsMap () {
        return new Map([
            ['Москва', 'moscow.csv']
        ]);
    }

    getFilePath (fileName) {
        return path.join(__dirname, fileName);
    }

    async importStreets (transaction) {
        for (const [cityName, fileName] of this.cityStreetsMap) {
            let city = await this.model.City.findOne({
                where: {name: cityName},
                transaction: transaction
            });
            if (!city)
                city = await this.model.City.create({name: cityName, builtIn: true }, {transaction: transaction});

            const filePath = path.join(__dirname, fileName);
            const builtInStreetNames = await this.getBuiltInNames(filePath, 'street');
            const currentStreetNames = await this.getCurrentObjNames('Street', transaction);

            const streetsToCreate = builtInStreetNames.filter(streetName => !currentStreetNames.includes(streetName)).map(streetName => { return {name: streetName, builtIn: true, cityId: city.id}});
            const streetsToDelete = currentStreetNames.filter(streetName => !builtInStreetNames.includes(streetName));

            await this.model.Street.bulkCreate(streetsToCreate, {transaction: transaction});
            await this.model.Street.destroy({ where: {name: streetsToDelete, builtIn: true}, transaction: transaction });
        }
    }

    async importCities (transaction) {
        const filePath = this.getFilePath('cities.csv');
        const builtInCityNames = await this.getBuiltInNames(filePath, 'city');
        const currentCityNames = await this.getCurrentObjNames('City', transaction);

        const citiesToCreate = builtInCityNames.filter(cityName => !currentCityNames.includes(cityName)).map(cityName => { return {name: cityName, builtIn: true}});
        const citiesToDelete = currentCityNames.filter(cityName => !builtInCityNames.includes(cityName));

        await this.model.City.bulkCreate(citiesToCreate, {transaction: transaction});
        await this.model.City.destroy({ where: {name: citiesToDelete, builtIn: true}, transaction: transaction });
    }


    async getBuiltInNames(filePath, columnName) {
        const builtInNames = [];
        try {
            const fileContent = await fsp.readFile(filePath, { encoding: 'utf8' });
            const lines = fileContent.trim().split('\n');
            const columns = lines[0].split(',');
            const columnIndex = columns.findIndex(column => column.trim() === columnName.trim());

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const columns = line.split(',');
                    if (columns.length > 0)
                        builtInNames.push(columns[columnIndex].trim());
                }
            }
            return builtInNames;
        } catch (error) {
            console.error('Ошибка при чтении файла:', error);
            return [];
        }
    }

    async getCurrentObjNames(modelName, transaction) {
        const currentObjs = await this.model[modelName].findAll({
            attributes: ['name'],
            transaction: transaction
        });
        return currentObjs.map(city => city.name);
    }

    async execute () {
        const transaction = await this.sequelize.transaction();
        try {
            await this.importCities(transaction);
            await this.importStreets(transaction);
            await transaction.commit();
            return true;
        } catch (err) {
            await transaction.rollback();
            console.log(err);
            return false;
        }
    }
};

module.exports = addressImporter;
