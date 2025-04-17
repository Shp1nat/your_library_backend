const BaseGetIdsOut = require('../baseGetterIdsOut');

class GetTypeIdsOut extends BaseGetIdsOut {
    static get url () {
        return '/proxy/get-type-ids-out.json';
    }

    get subtype () {
        return 'type';
    }

    get fields () {
        return ['id', 'name', 'description', 'updatedAt'];
    }

    get oneItemFields () {
        return [];
    }

    get ObjModel () {
        return this.model.Type;
    }
}

module.exports = GetTypeIdsOut;
