const BaseGetIdsOut = require('../baseGetterIdsOut');

class GetStreetIdsOut extends BaseGetIdsOut {
    static get url () {
        return '/proxy/get-street-ids-out.json';
    }

    get subtype () {
        return 'street';
    }

    get fields () {
        return ['id', 'name', 'description', 'updatedAt'];
    }

    get oneItemFields () {
        return [];
    }

    getIncludes () {
        return [
            {
                model: this.model.City,
                attributes: ['id', 'name'],
                as: 'city'
            }
        ];
    }

    get ObjModel () {
        return this.model.Street;
    }
}

module.exports = GetStreetIdsOut;
