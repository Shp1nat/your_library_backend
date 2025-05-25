class BaseSetter {
    constructor(app) {
        this.app = app;
        this.model = app?.model;
        this.sequelize = app?.connection?.sequelize;
        this.execute = this.execute.bind(this);
    }

    async getObjById (modelName, objId, transaction) {
        return this.model[modelName].findOne({
            where: {id: objId},
            transaction: transaction
        });
    }

    async getObjsByIds (modelName, objIds, transaction) {
        return this.model[modelName].findAll({
            where: {id: objIds},
            transaction: transaction
        });
    }

    idsArraysEqual (ids1, ids2) {
        if (ids1.length !== ids2.length) {
            return false;
        }

        const sortedIds1 = [...ids1].sort((a, b) => a - b);
        const sortedIds2 = [...ids2].sort((a, b) => a - b);

        for (let i = 0; i < sortedIds1.length; i++) {
            if (sortedIds1[i] !== sortedIds2[i]) {
                return false;
            }
        }

        return true;
    }

    get duplicateErrorMessage() {
        return 'Объект с такими данными уже существует';
    }

    get formatErrorMessage() {
        return 'Неверный формат ввода';
    }

    async validate (inData) {
        if (!inData)
            throw new Error(this.formatErrorMessage);
    }

    async executeSetter (inData) {
        throw new Error('executeSetter must be implemented');
    }

    async execute (inData) {
        const transactionFromParent = !!inData.transaction;
        const transaction = transactionFromParent ? inData.transaction : await this.sequelize.transaction();
        inData.transaction = transaction;
        let status;
        let response;
        try {
            const keys = Object.keys(inData.body);
            const prop = keys[0];
            if (typeof inData.body[prop] === 'string')
                inData.body[prop] = JSON.parse(inData.body[prop]);
            if (inData.file) {
                inData.body[prop].picture = inData.file.buffer;
                if (!inData.file.originalname || inData.file.originalname.length < 5) {
                    throw new Error('Неверный формат названия файла');
                }
                const allowedTypes = ['.png', '.jpg', '.gif'];
                const fileType = inData.file.originalname.slice(-4);
                if (!allowedTypes.includes(fileType))
                    throw new Error('Для загрузки доступны лишь файлы с расширениями .jpg, .png, .gif');
            }

            const result = await this.executeSetter(Object.assign(inData.body, { transaction: inData.transaction }));
            if (result && result.result === false) {
                if (!transactionFromParent)
                    await transaction.rollback();
                status = 400;
            } else {
                if (!transactionFromParent)
                    await transaction.commit();
                status = 200;
            }
            response = { result: result };
        } catch (error) {
            console.log(error);
            if (!transactionFromParent)
                await transaction.rollback();
            status = 400;
            response = { error: error.message };
        }
        inData.res.status(status).json(response);
    }

}

module.exports = BaseSetter;
