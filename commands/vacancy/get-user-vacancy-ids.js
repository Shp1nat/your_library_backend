const BaseGetIds = require('../baseGetterIds');

class GetUserVacancyIds extends BaseGetIds {
    constructor (app) {
        super(app);
        this.condVars = ['id', 'status', 'text', 'updatedAt'];
        this.searchColumns = ['id', 'status', 'text'];
        this.orderColumns = ['id', 'status', 'text', 'updatedAt'];
        this.columns = ['id', 'status', 'text', 'updatedAt'];
        this.defaultOrder = 'text';
        this.ignore = [];
    }

    static get url () {
        return '/proxy/get-user-vacancy-ids.json';
    }

    async executeGetterIds (inData) {
        const query = this.prepareQuery(inData);
        query.where = {...query.where, userId: inData.userId};
        let vacancies = [];
        try {
            vacancies = await this.model.Vacancy.findAll(query);
        } catch (err) {
            vacancies = [];
        }
        return { rows: vacancies.map(vacancy => vacancy.id).slice(0, 1000), subtype: 'vacancy' };
    }
}

module.exports = GetUserVacancyIds;
