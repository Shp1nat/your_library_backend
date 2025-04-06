const BaseRemover = require('../baseRemover');

class RemovePublisher extends BaseRemover {
    static get url () {
        return '/proxy/remove-publisher.json';
    }

    get idsErrorMessage() {
        return 'Набор издательств для удаления не указаны';
    }

    get findErrorMessage() {
        return 'Наборы издательств с данными id не были найдены';
    }

    async validate(inData) {
        if (!inData?.publisher)
            throw new Error(this.formatErrorMessage);
        if (!inData.publisher.id || (Array.isArray(inData.publisher.id) && inData.publisher.id.length === 0))
            throw new Error(this.idsErrorMessage);
    }

    async removePublisher (inData) {
        const publishers = await this.model.Publisher.findAll({
            where: {id: inData.publisher.id},
            include: {
                model: this.model.Address,
                as: 'addresses',
                attributes: ['id'],
                through: {attributes: []}
            },
            transaction: inData.transaction});
        if (publishers.length < 1)
            throw new Error(this.findErrorMessage);

        const ids = publishers.map(a => a.id);
        const addressIds = publishers.flatMap(publisher => publisher.addresses.map(address => address.id));
        await this.model.Publisher.destroy({ where: { id: ids}, transaction: inData.transaction });
        await this.model.Example.destroy({ where: { publisherId: ids}, transaction: inData.transaction });
        //todo handle orders after examples are deleted
        await this.model.Address_Publisher.destroy({ where: { PublisherId: ids}, transaction: inData.transaction });
        await this.model.Address.destroy({ where: { id: addressIds}, transaction: inData.transaction });
        return ids;
    }

    async executeRemover (inData) {
        const ids = await this.removePublisher(inData);
        return { id: ids };
    }

}

module.exports = RemovePublisher;
