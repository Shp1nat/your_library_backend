const BaseRemover = require('../baseRemover');

class RemoveCity extends BaseRemover {
    static get url () {
        return '/proxy/remove-city.json';
    }

    get idsErrorMessage() {
        return 'Набор городов для удаления не указаны';
    }

    get findErrorMessage() {
        return 'Наборы городов с данными id не были найдены';
    }

    async validate (inData) {
        if (!inData?.city)
            throw new Error(this.formatErrorMessage);
        if (!inData.city.id || (Array.isArray(inData.city.id) && inData.city.id.length === 0))
            throw new Error(this.idsErrorMessage);
    }

    async removeCity (inData) {
        const cities = await this.model.City.findAll({where: {id: inData.city.id}, transaction: inData.transaction});
        if (cities.length < 1)
            throw new Error(this.findErrorMessage);

        const ids = cities.map(a => a.id);
        await this.model.City.destroy({ where: { id: ids}, transaction: inData.transaction });
        await this.model.Street.destroy({ where: { cityId: ids}, transaction: inData.transaction });
        await this.model.Address.update({cityId: null}, { where: { cityId: ids}, transaction: inData.transaction });

        return ids;
    }

    async executeRemover (inData) {
        await this.validate(inData);
        const ids = await this.removeCity(inData);
        return { id: ids };
    }

}

module.exports = RemoveCity;
