const { Op } = require('sequelize');
const moment = require('moment');

class BaseGetIds {
    constructor (app) {
        this.app = app;
        this.model = app?.model;
        this.sequelize = app?.connection?.sequelize;
        this.execute = this.execute.bind(this);
    }

    parseDate (date, start) {
        date = moment(date, 'DD.MM.YYYY');
        if (start)
            return date.startOf('day');
        else
            return date.endOf('day');
    }

    mergeArrays (arrays, orders) {
        let len = arrays.length;
        if (len < 2) {
            return arrays[0];
        } else if (len === 2) {
            return this.merge2Arrays(arrays[0], arrays[1], orders);
        } else if (len === 3) {
            let merged = this.merge2Arrays(arrays[0], arrays[1], orders);
            return this.merge2Arrays(merged, arrays[2], orders);
        } else {
            let middle = Math.floor(len / 2);
            let left = arrays.slice(0, middle);
            let right = arrays.slice(middle, len);
            return this.merge2Arrays(this.mergeArrays(left, orders), this.mergeArrays(right, orders), orders);
        }
    }

    compare (left, right, order) {
        if (typeof left === 'string')
            left = left.toLowerCase();
        if (typeof right === 'string')
            right = right.toLowerCase();
        let res = '';
        if (order === 'DESC') {
            res = left > right;
            if (right === null)
                res = true;
        } else {
            res = left < right;
            if (right === null)
                res = true;
        }
        return res;
    }

    merge2Arrays (left, right, order) {
        let final = [];
        while (left.length && right.length) {
            if (this.compare(left[0].sort, right[0].sort, order))
                final.push(left.shift());
            else
                final.push(right.shift());
        }
        return [...final, ...left, ...right];
    }

    getSqlOperator (condition) {
        switch (condition.operator) {
            case 'true':
                return this.sequelize.literal('TRUE');
            case 'false':
                return this.sequelize.literal('FALSE');
            case 'contain':
                condition.value = condition.value.replace(/(_|%|\\)/g, '\\$1');
                return { [condition.var]: { [Op.iLike]: '%' + condition.value + '%' } };
            case 'not_contain':
                condition.value = condition.value.replace(/(_|%|\\)/g, '\\$1');
                return { [condition.var]: {[Op.or]: {[Op.is]: null, [Op.notILike]: '%' + condition.value + '%' }}};
            case 'is_null':
                return { [condition.var]: { [Op.is]: null } };
            case 'is_not_null':
                return { [condition.var]: { [Op.not]: null } };
            case 'contain_in':
                return { [condition.var]: { [Op.in]: condition.value } };
            case 'not_contain_in':
                return { [condition.var]: { [Op.notIn]: condition.value } };
            case 'equal':
                return { [condition.var]: { [Op.eq]: condition.value } };
            case 'not_equal':
                return { [condition.var]: { [Op.ne]: condition.value } };
            case 'greater_or_equal':
                return { [condition.var]: { [Op.gte]: condition.value } };
            case 'less_or_equal':
                return { [condition.var]: { [Op.lte]: condition.value } };
            case 'and':
                return {[Op.and]: condition.value};
            case 'or':
                return {[Op.or]: condition.value};
            default:
                return this.sequelize.literal('TRUE');
        }
    }

    prepareSqlOperator (inData, condition, subtype) {
        if (this.ignore.includes(condition.var))
            return this.getSqlOperator({operator: 'true'});
        if (!this.condVars.includes(condition.var))
            return null;
        if (condition.var === 'updater')
            condition.var = 'updaterId';
        if (condition.var === 'tags')
            condition.var = '$tags.id$';
        if (condition.var === 'updatedAt')
            condition.value = this.parseDate(condition.value, condition.operator === 'greater_or_equal');
        if (condition.var === 'type') {
            const typeCheck = subtype === condition.value || (Array.isArray(condition.value) && condition.value.includes(subtype));
            const isEqual = condition.operator === 'equal' || condition.operator === 'contain_in';
            const result = (!isEqual && !typeCheck) || (isEqual && typeCheck);
            if (result)
                return this.getSqlOperator({operator: 'true'});
            else
                return this.getSqlOperator({operator: 'false'});
        }
        return this.getSqlOperator(condition);
    }

    formConditions (inData, condis) {
        let conds = condis.conditions;
        let conditions = [];
        let query = {};
        conds.forEach(c => {
            let cond = {};
            if (c.main_cond) {
                c.subtype = inData.subtype;
                cond = this.formConditions(inData, c);
            } else {
                cond = this.prepareSqlOperator(inData, {var: c.var, operator: c.operator, value: c.value}, inData.subtype);
            }
            if (cond !== null)
                conditions.push(cond);
        });

        if (condis.main_cond === 'and')
            query = {[Op.and]: conditions};
        else
            query = {[Op.or]: conditions};
        return query;
    }

    get queryInclude () {
        return [];
    }

    getSort (inData) {
        let sortCol = this.defaultOrder;
        let orders = [];
        if (this.orderColumns.includes(inData.sort_col)) {
            if (inData.sort_col === 'updater' || inData.sort_col === 'rulesCount') {
                sortCol = this.sequelize.literal(`"${inData.sort_col}"`);
                orders.push([sortCol]);
            } else if (inData.sort_col === 'tags') {
                sortCol = this.sequelize.literal('"tagsNum"');
                orders.push([sortCol]);
                sortCol = this.sequelize.literal('"tags"');
                orders.push([sortCol]);
            } else {
                orders.push([inData.sort_col]);
            }
        } else {
            orders.push([this.defaultOrder]);
        }
        orders.forEach(order => {
            if (inData.sort_dir === 'desc') {
                inData.sort = 'DESC';
                order.push('DESC');
            } else {
                inData.sort = 'ASC';
                order.push('ASC');
            };
            order.push('NULLS LAST');
        });
        return {order: orders, sort: sortCol};
    }

    prepareSearch (inData, conditions) {
        const searchConditions = [];
        this.searchColumns.forEach(col => {
            let cond = this.prepareSqlOperator(inData, {var: col, operator: 'contain', value: inData.search});
            if (cond !== null)
                searchConditions.push(cond);
        });
        conditions.push({ [Op.or]: searchConditions });
    }

    prepareDates (inData, conditions) {
        const timeConditions = [];
        if (inData.updatedAt.start) {
            let start = this.parseDate(inData.updatedAt.start, 'start');
            timeConditions.push({updatedAt: {[Op.gte]: start}});
        }
        if (inData.updatedAt.finish) {
            let finish = this.parseDate(inData.updatedAt.finish, 'finish');
            timeConditions.push({updatedAt: {[Op.lte]: finish}});
        }
        conditions.push({[Op.and]: timeConditions});
    }

    prepareConditions (inData) {
        const conditions = [];
        if (inData.search)
            this.prepareSearch(inData, conditions);

        const checkConditions = Array.isArray(inData.conditions) && inData.conditions.length > 0;

        if (checkConditions) {
            const condConditions = this.formConditions(inData, inData);
            if (condConditions)
                conditions.push(condConditions);
        }

        if (inData.updatedAt)
            this.prepareDates(inData, conditions);
        return conditions;
    }

    prepareQuery (inData) {
        const attr = this.columns;
        const query = {
            attributes: attr,
            where: {},
            include: this.queryInclude
        };

        const conditions = this.prepareConditions(inData);

        const sort = this.getSort(inData);
        query.order = sort.order;

        if (conditions)
            query.where = {[Op.and]: conditions};

        return query;
    }

    async executeGetterIds (inData) {
        throw new Error('executeGetterIds must be implemented');
    }

    async execute (inData) {
        let status;
        let response;
        try {
            const result = await this.executeGetterIds(inData.body);
            status = 200;
            response = { result: result };
        } catch (error) {
            console.log(error);
            status = 400;
            response = { error: error.message };
        }
        inData.res.status(status).json(response);
    }

}

module.exports = BaseGetIds;
