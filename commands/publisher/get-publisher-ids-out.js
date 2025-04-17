const BaseGetIdsOut = require('../baseGetterIdsOut');

class GetPublisherIdsOut extends BaseGetIdsOut {
    static get url () {
        return '/proxy/get-publisher-ids-out.json';
    }

    get subtype () {
        return 'publisher';
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
                model: this.model.Address,
                attributes: ['id', 'house', 'floor', 'apartNum', 'updatedAt'],
                as: 'addresses',
                through: {attributes: []}
            }
        ];
    }

    get ObjModel () {
        return this.model.Publisher;
    }
}

module.exports = GetPublisherIdsOut;
