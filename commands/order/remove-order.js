const BaseRemover = require('../baseRemover');

class RemoveOrder extends BaseRemover {
    static get url () {
        return '/proxy/remove-order.json';
    }

    get idsErrorMessage() {
        return 'Набор заказов для удаления не указан';
    }

    get findErrorMessage() {
        return 'Наборы заказов с данными id не были найдены';
    }

    async validate (inData) {
        if (!inData?.order)
            throw new Error(this.formatErrorMessage);
        if (!inData.order.id || (Array.isArray(inData.order.id) && inData.order.id.length === 0))
            throw new Error(this.idsErrorMessage);
    }

    async restoreExamples (orderIds, transaction) {
        const objs = await this.model.Order_Example.findOne({
            attributes: ['OrderId', 'ExampleId'],
            where: { OrderId: orderIds },
            transaction: transaction,
        });

        const idCount = {};
        for (const obj of objs) {
            const id = obj.ExampleId;
            idCount[id] = (idCount[id] || 0) + 1;
        }

        for (const id in idCount)
            await this.model.Example.increment({availableCount: idCount[id]}, {where: {id: id}, transaction: transaction});
    }

    async removeOrder (inData) {
        const orders = await this.model.Order.findAll({where: {id: inData.order.id}, transaction: inData.transaction});
        if (orders.length < 1)
            throw new Error(this.findErrorMessage);

        const ids = orders.map(a => a.id);
        await this.model.Order.destroy({ where: { id: ids}, transaction: inData.transaction });

        await this.restoreExamples(ids, inData.transaction);
        await this.model.Order_Example.destroy({ where: { OrderId: ids}, transaction: inData.transaction });

        return ids;
    }

    async executeRemover (inData) {
        await this.validate(inData);
        const ids = await this.removeOrder(inData);
        return { id: ids };
    }

}

module.exports = RemoveOrder;
