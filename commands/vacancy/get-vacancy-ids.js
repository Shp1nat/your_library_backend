const BaseGetIds = require('../baseGetterIds');

class GetVacancyIds extends BaseGetIds {
    constructor (app) {
        super(app);
        this.condVars = ['id', 'status', 'text', 'updatedAt'];
        this.searchColumns = ['id', 'status', 'text'];
        this.orderColumns = ['id', 'status', 'text', 'updatedAt'];
        this.columns = ['id', 'status', 'text', 'updatedAt'];
        this.defaultOrder = 'updatedAt';
        this.ignore = [];
    }

    static get url () {
        return '/proxy/get-vacancy-ids.json';
    }

    async executeGetterIds (inData) {
        const query = this.prepareQuery(inData);
        const vacancies = await this.model.Vacancy.findAll(query);
        return { rows: vacancies.map(vacancy => vacancy.id).slice(0, 1000), subtype: 'vacancy' };
    }
}

module.exports = GetVacancyIds;
