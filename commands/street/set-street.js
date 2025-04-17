const BaseSetter = require('../baseSetter');

class SetStreet extends BaseSetter {
    static get url () {
        return '/proxy/set-street.json';
    }

    get duplicateErrorMessage() {
        return 'Улица с данным названием уже существует в выбранном городе';
    }

    async validate(inData) {
        if (!inData?.street || !inData.street.name || !inData.street.city)
            throw new Error(this.formatErrorMessage);

        let street = await this.getStreet(inData.street.id || null);
        if (!street || street.name !== inData.street.name || street.cityId !== inData.street.city.id) {
            street = await this.model.Type.findOne({
                where: {
                    name: inData.street.name,
                    cityId: inData.street.city.id
                },
                transaction: inData.transaction
            });
            if (street)
                throw new Error(this.duplicateErrorMessage);
        }
    }

    async getStreet (streetId, transaction) {
        return this.model.Street.findOne({
            where: {id: streetId},
            transaction: transaction
        });
    }

    async createOrUpdateStreet (inData) {
        let street;
        const defaults = {
            name: inData.street.name,
            description: inData.street.description
        };

        if (inData.street.id || inData.street.id === 0) {
            street = await this.getStreet(inData.street.id, inData.transaction);
            if (street) {
                await street.update(defaults, { transaction: inData.transaction});
            }
        } else {
            street = await this.model.Street.create(defaults, { transaction: inData.transaction });
            street = await this.getStreet(street.id, inData.transaction);
        }

        if (!street)
            throw new Error('Ошибка');

        const city = await this.getObjById('City', inData.street.city.id, inData.transaction);
        await street.setCity(city, {transaction: inData.transaction});

        return street;
    }

    async executeSetter (inData) {
        await this.validate(inData);
        const street = await this.createOrUpdateStreet(inData);
        return { id: street.id, updatedAt: street.updatedAt };
    }

}

module.exports = SetStreet;
