const BaseSetter = require('../baseSetter');

class SetAddress extends BaseSetter {
    static get url () {
        return '/proxy/set-address.json';
    }

    async validate (inData) {
        if (!inData?.address || !inData.address.city || !inData.address.street || !inData.address.house)
            throw new Error(this.formatErrorMessage);
    }

    async getAddress (addressId, transaction) {
        return this.model.Address.findOne({
            where: {id: addressId},
            transaction: transaction
        });
    }

    async setAddressProps (address, cityId, streetId, transaction) {
        const city = await this.getObjById('City', cityId, transaction);
        const street = await this.getObjById('Street', streetId, transaction);

        await address.setCity(city, {transaction: transaction});
        await address.setStreet(street, {transaction: transaction});
    }

    async createOrUpdateAddress (inData) {
        let address;
        const defaults = {
            house: inData.address.house,
            floor: inData.address.floor,
            apartNum: inData.address.apartNum
        };

        if (inData.address.id || inData.address.id === 0) {
            address = await this.getAddress(inData.address.id, inData.transaction);
            if (address) {
                await address.update(defaults, { transaction: inData.transaction});
            }
        } else {
            address = await this.model.Address.create(defaults, { transaction: inData.transaction });
            address = await this.getAddress(address.id, inData.transaction);
        }

        if (!address)
            throw new Error('Ошибка');

        await this.setAddressProps(address, inData.address.city.id, inData.address.street.id, inData.transaction);

        return address;
    }

    async executeSetter (inData) {
        await this.validate(inData);
        const address = await this.createOrUpdateAddress(inData);
        return { id: address.id, updatedAt: address.updatedAt };
    }

};

module.exports = SetAddress;
