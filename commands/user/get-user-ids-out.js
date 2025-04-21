const BaseGetIdsOut = require('../baseGetterIdsOut');

class GetUserIdsOut extends BaseGetIdsOut {
    static get url () {
        return '/proxy/get-user-ids-out.json';
    }

    get subtype () {
        return 'user';
    }

    get fields () {
        return ['id', 'login', 'name', 'lastname', 'age'];
    }

    get oneItemFields () {
        return [];
    }

    get ObjModel () {
        return this.model.User;
    }
}

module.exports = GetUserIdsOut;
