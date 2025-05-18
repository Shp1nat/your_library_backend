const BaseGetIdsOut = require('../baseGetterIdsOut');

class GetUserOrderIdsOut extends BaseGetIdsOut {
    static get url () {
        return '/proxy/get-user-order-ids-out.json';
    }

    get subtype () {
        return 'order';
    }

    get fields () {
        return ['id', 'status', 'finishDate', 'updatedAt', 'createdAt'];
    }

    get oneItemFields () {
        return [];
    }

    getIncludes () {
        return [
            {
                model: this.model.Example,
                as: 'examples',
                attributes: ['id', 'name'],
                through: {attributes: []}
            }
        ];
    }

    get ObjModel () {
        return this.model.Order;
    }
}

module.exports = GetUserOrderIdsOut;
