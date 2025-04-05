const BaseGetIdsOut = require('../baseGetterIdsOut');

class GetAddressIdsOut extends BaseGetIdsOut {
    static get url () {
        return '/proxy/get-address-ids-out.json';
    }

    get subtype () {
        return 'address';
    }

    get fields () {
        return ['id', 'house', 'floor', 'apartNum', 'updatedAt'];
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
            },
            {
                model: this.model.Street,
                attributes: ['id', 'name'],
                as: 'street'
            }
        ];
    }

    get ObjModel () {
        return this.model.Address;
    }
}

module.exports = GetAddressIdsOut;
