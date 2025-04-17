const BaseSetter = require('../baseSetter');

class SetCity extends BaseSetter {
    static get url () {
        return '/proxy/set-city.json';
    }

    get duplicateErrorMessage() {
        return 'Город с данным названием уже существует';
    }

    async validate(inData) {
        if (!inData?.city || !inData.city.name)
            throw new Error(this.formatErrorMessage);

        let city = await this.getCity(inData.city.id || null);
        if (!city || city.name !== inData.city.name) {
            city = await this.model.Type.findOne({
                where: {
                    name: inData.city.name
                },
                transaction: inData.transaction
            });
            if (city)
                throw new Error(this.duplicateErrorMessage);
        }
    }

    async getCity (cityId, transaction) {
        return this.model.City.findOne({
            where: {id: cityId},
            transaction: transaction
        });
    }

    async createOrUpdateCity (inData) {
        let city;
        const defaults = {
            name: inData.city.name,
            description: inData.city.description
        };

        if (inData.city.id || inData.city.id === 0) {
            city = await this.getCity(inData.city.id, inData.transaction);
            if (city)
                await city.update(defaults, { transaction: inData.transaction});
        } else {
            city = await this.model.City.create(defaults, { transaction: inData.transaction });
            city = await this.getCity(city.id, inData.transaction);
        }

        if (!city)
            throw new Error('Ошибка');

        return city;
    }

    async executeSetter (inData) {
        await this.validate(inData);
        const city = await this.createOrUpdateCity(inData);
        return { id: city.id, updatedAt: city.updatedAt };
    }

}

module.exports = SetCity;
