const BaseRemover = require('../baseRemover');

class RemoveVacancy extends BaseRemover {
    static get url () {
        return '/proxy/remove-vacancy.json';
    }

    get idsErrorMessage() {
        return 'Набор вакансий для удаления не указан';
    }

    get findErrorMessage() {
        return 'Наборы вакансий с данными id не были найдены';
    }

    async validate (inData) {
        if (!inData?.vacancy)
            throw new Error(this.formatErrorMessage);
        if (!inData.vacancy.id || (Array.isArray(inData.vacancy.id) && inData.vacancy.id.length === 0))
            throw new Error(this.idsErrorMessage);
    }

    async removeVacancy (inData) {
        const vacancies = await this.model.Vacancy.findAll({where: {id: inData.vacancy.id}, transaction: inData.transaction});
        if (vacancies.length < 1)
            throw new Error(this.findErrorMessage);

        const ids = vacancies.map(a => a.id);
        await this.model.Vacancy.destroy({ where: { id: ids}, transaction: inData.transaction });

        return ids;
    }

    async executeRemover (inData) {
        await this.validate(inData);
        const ids = await this.removeVacancy(inData);
        return { id: ids };
    }

}

module.exports = RemoveVacancy;
