const BaseGetIds = require('../baseGetterIds');

class GetTypeIds extends BaseGetIds {
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
        return '/proxy/get-type-ids.json';
    }

    async executeGetterIds (inData) {
        const query = this.prepareQuery(inData);
        const types = await this.model.Type.findAll(query);
        return { rows: types.map(type => type.id).slice(0, 1000), subtype: 'type' };
    }

}

module.exports = GetTypeIds;
