const BaseGetIdsOut = require('../baseGetterIdsOut');

class GetUserVacancyIdsOut extends BaseGetIdsOut {
    static get url () {
        return '/proxy/get-user-vacancy-ids-out.json';
    }

    get subtype () {
        return 'vacancy';
    }

    get fields () {
        return ['id', 'status', 'text', 'updatedAt', 'createdAt'];
    }

    get oneItemFields () {
        return [];
    }

    getIncludes () {
        return [];
    }

    get ObjModel () {
        return this.model.Vacancy;
    }
}

module.exports = GetUserVacancyIdsOut;
