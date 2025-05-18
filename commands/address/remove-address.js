const BaseRemover = require('../baseRemover');

class RemoveAddress extends BaseRemover {
    static get url () {
        return '/proxy/remove-address.json';
    }

    get idsErrorMessage() {
        return 'Набор адресов для удаления не указаны';
    }

    get findErrorMessage() {
        return 'Наборы адресов с данными id не были найдены';
    }

    async validate (inData) {
        if (!inData?.address)
            throw new Error(this.formatErrorMessage);
        if (!inData.address.id || (Array.isArray(inData.address.id) && inData.address.id.length === 0))
            throw new Error(this.idsErrorMessage);
    }

    async removeAddress (inData) {
        const addresses = await this.model.Address.findAll({where: {id: inData.address.id}, transaction: inData.transaction});
        if (addresses.length < 1)
            throw new Error(this.findErrorMessage);

        const ids = addresses.map(a => a.id);
        await this.model.Address.destroy({ where: { id: ids}, transaction: inData.transaction });
        await this.model.Address_Publisher.destroy({ where: { AddressId: ids}, transaction: inData.transaction });
        await this.model.Address_User.destroy({ where: { AddressId: ids}, transaction: inData.transaction });

        return ids;
    }

    async executeRemover (inData) {
        await this.validate(inData);
        const ids = await this.removeAddress(inData);
        return { id: ids };
    }

}

module.exports = RemoveAddress;
