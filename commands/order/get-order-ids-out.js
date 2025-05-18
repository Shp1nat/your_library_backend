const BaseGetIdsOut = require('../baseGetterIdsOut');

class GetOrderIdsOut extends BaseGetIdsOut {
    static get url () {
        return '/proxy/get-order-ids-out.json';
    }

    get subtype () {
        return 'order';
    }

    get fields () {
        return ['id', 'status', 'finishDate', 'updatedAt'];
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
            },
            {
                model: this.model.User,
                as: 'user',
                attributes: ['id', 'login', 'name', 'lastname', 'patronymic', 'age', 'penaltyPoints'],
            }
        ];
    }

    get ObjModel () {
        return this.model.Order;
    }
}

module.exports = GetOrderIdsOut;
