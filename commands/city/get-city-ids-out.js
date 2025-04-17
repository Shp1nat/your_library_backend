const BaseGetIdsOut = require('../baseGetterIdsOut');

class GetCityIdsOut extends BaseGetIdsOut {
    static get url () {
        return '/proxy/get-city-ids-out.json';
    }

    get subtype () {
        return 'city';
    }

    get fields () {
        return ['id', 'name', 'description', 'updatedAt'];
    }

    get oneItemFields () {
        return [];
    }

    get ObjModel () {
        return this.model.City;
    }
}

module.exports = GetCityIdsOut;
