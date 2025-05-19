const BaseGetIdsOut = require('../baseGetterIdsOut');

class GetVacancyIdsOut extends BaseGetIdsOut {
    static get url () {
        return '/proxy/get-vacancy-ids-out.json';
    }

    get subtype () {
        return 'vacancy';
    }

    get fields () {
        return ['id', 'status', 'text', 'updatedAt'];
    }

    get oneItemFields () {
        return [];
    }

    getIncludes () {
        return [
            {
                model: this.model.User,
                as: 'user',
                attributes: ['id', 'login', 'name', 'lastname', 'patronymic', 'age', 'penaltyPoints']
            }
        ];
    }

    get ObjModel () {
        return this.model.Vacancy;
    }
}

module.exports = GetVacancyIdsOut;
