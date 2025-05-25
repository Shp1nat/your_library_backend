class BaseGetIdsOut {
    constructor (app) {
        this.app = app;
        this.model = app?.model;
        this.sequelize = app?.connection?.sequelize;
        this.execute = this.execute.bind(this);
    }

    getIncludes (inData) {
        return [];
    }

    prepareQuery (inData) {
        const ids = [];
        if (inData.rows) {
            inData.isMany = true;
            inData.rows.forEach(id => {
                ids.push(id);
            });
        } else if (inData[this.subtype]) {
            inData.isMany = false;
            ids.push(inData[this.subtype].id);
        }
        if (ids.length === 0)
            return null;
        let tableName = this.ObjModel.name;
        let query = {
            where: {
                id: ids
            },
            attributes: [...this.fields, ...(inData.isMany ? [] : this.oneItemFields)],
            include: this.getIncludes(inData),
            order: this.sequelize.literal('(' + ids.map(id => { return `"${tableName}"."id" = '` + id + '\''; }).join(', ') + ') DESC')
        };

        return query;
    }

    get oneItemFields () {
        return [];
    }

    async runQuery (query) {
        let	obj = await this.ObjModel.findAll(query);
        return obj;
    }

    prepareOneObject (obj) {
        return obj;
    }

    prepareOneOfManyObjects (obj) {}

    prepareResult (inData) {
        if (inData.isMany === true) {
            const result = inData.result.map(obj => {
                const objJson = obj.toJSON();
                this.prepareOneOfManyObjects(objJson);
                return objJson;
            });
            return {rows: result};
        } else {
            if (inData.result.length === 0)
                throw new Error('Действие с данным id не найдены');
            let obj = inData.result[0].toJSON();
            return {[this.subtype]: this.prepareOneObject(obj)};
        }
    }

    async executeGetterIdsOut (inData) {
        try {
            const query = this.prepareQuery(inData);
            inData.result = await this.runQuery(query);
            return this.prepareResult(inData);
        } catch (error) {
            console.log(error);
            throw (error);
        }
    }

    async execute (inData) {
        let status;
        let response;
        try {
            const result = await this.executeGetterIdsOut(inData.body);
            if (result.rows) {
                for (const row of result.rows) {
                    if (row.picture)
                        row.picture = row.picture?.toString('base64') || null;
                }
            } else {
                if (!result.error) {
                    const keys = Object.keys(result);
                    const prop = keys[0];
                    result[prop].picture = result[prop].picture?.toString('base64') || null;
                }
            }
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

module.exports = BaseGetIdsOut;
