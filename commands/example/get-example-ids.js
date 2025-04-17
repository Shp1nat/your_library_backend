const BaseGetIds = require('../baseGetterIds');

class GetExampleIds extends BaseGetIds {
    constructor (app) {
        super(app);
        this.condVars = ['name', 'description', 'year', 'availableCount', 'updatedAt'];
        this.searchColumns = ['name', 'description'];
        this.orderColumns = ['id', 'name', 'year', 'availableCount', 'description', 'updatedAt'];
        this.columns = ['id'];
        this.defaultOrder = 'name';
        this.ignore = [];
    }

    static get url () {
        return '/proxy/get-example-ids.json';
    }

    async executeGetterIds (inData) {
        const query = this.prepareQuery(inData);
        const examples = await this.model.Example.findAll(query);
        return { rows: examples.map(example => example.id).slice(0, 1000), subtype: 'example' };
    }

}

module.exports = GetExampleIds;
