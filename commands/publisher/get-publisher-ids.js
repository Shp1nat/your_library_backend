const BaseGetIds = require('../baseGetterIds');

class GetPublisherIds extends BaseGetIds {
    constructor (app) {
        super(app);
        this.condVars = ['name', 'description', 'updatedAt'];
        this.searchColumns = ['name', 'description'];
        this.orderColumns = ['id', 'name', 'description', 'updatedAt'];
        this.columns = ['id'];
        this.defaultOrder = 'name';
        this.ignore = [];
    }

    static get url () {
        return '/proxy/get-publisher-ids.json';
    }

    async executeGetterIds (inData) {
        const query = this.prepareQuery(inData);
        const publishers = await this.model.Publisher.findAll(query);
        return { rows: publishers.map(publisher => publisher.id).slice(0, 1000), subtype: 'publisher' };
    }

}

module.exports = GetPublisherIds;
