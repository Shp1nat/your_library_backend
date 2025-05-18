const BaseRemover = require('../baseRemover');

class RemoveStreet extends BaseRemover {
    static get url () {
        return '/proxy/remove-street.json';
    }

    get idsErrorMessage() {
        return 'Набор улиц для удаления не указаны';
    }

    get findErrorMessage() {
        return 'Наборы улиц с данными id не были найдены';
    }

    async validate (inData) {
        if (!inData?.street)
            throw new Error(this.formatErrorMessage);
        if (!inData.street.id || (Array.isArray(inData.street.id) && inData.street.id.length === 0))
            throw new Error(this.idsErrorMessage);
    }

    async removeStreet (inData) {
        const streets = await this.model.Street.findAll({where: {id: inData.street.id}, transaction: inData.transaction});
        if (streets.length < 1)
            throw new Error(this.findErrorMessage);

        const ids = streets.map(a => a.id);
        await this.model.Street.destroy({ where: { id: ids}, transaction: inData.transaction });
        await this.model.Address.update({streetId: null}, { where: { streetId: ids}, transaction: inData.transaction });

        return ids;
    }

    async executeRemover (inData) {
        await this.validate(inData);
        const ids = await this.removeStreet(inData);
        return { id: ids };
    }

}

module.exports = RemoveStreet;
