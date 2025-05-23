const BaseGetIds = require('../baseGetterIds');

class GetStreetIds extends BaseGetIds {
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
        return '/proxy/get-street-ids.json';
    }

    async executeGetterIds (inData) {
        const query = this.prepareQuery(inData);
        const streets = await this.model.Street.findAll(query);
        return { rows: streets.map(street => street.id).slice(0, 1000), subtype: 'street' };
    }

}

module.exports = GetStreetIds;
