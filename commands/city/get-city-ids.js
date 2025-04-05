const BaseGetIds = require('../baseGetterIds');

class GetCityIds extends BaseGetIds {
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
        return '/proxy/get-city-ids.json';
    }

    async executeGetterIds (inData) {
        const query = this.prepareQuery(inData);
        const cities = await this.model.City.findAll(query);
        return { rows: cities.map(city => city.id).slice(0, 1000), subtype: 'city' };
    }

}

module.exports = GetCityIds;
