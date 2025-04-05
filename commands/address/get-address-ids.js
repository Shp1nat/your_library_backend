const BaseGetIds = require('../baseGetterIds');

class GetAddressIds extends BaseGetIds {
    constructor (app) {
        super(app);
        this.condVars = ['updatedAt'];
        this.searchColumns = [];
        this.orderColumns = ['id', 'updatedAt'];
        this.columns = ['id'];
        this.defaultOrder = 'id';
        this.ignore = [];
    }

    static get url () {
        return '/proxy/get-address-ids.json';
    }

    async executeGetterIds (inData) {
        const query = this.prepareQuery(inData);
        const addresses = await this.model.Address.findAll(query);
        return { rows: addresses.map(address => address.id).slice(0, 1000), subtype: 'address' };
    }
}

module.exports = GetAddressIds;
