const { containerBootstrap } = require('@nlpjs/core');
const { DomainManager, NluNeural } = require('@nlpjs/nlu');
const { LangPt } = require('@nlpjs/lang-pt');

function addFoodDomain(manager) {
    manager.add('food', 'meu carrinho', 'order.check');
    manager.add('food', 'o que tenho no meu carrinho', 'order.check');
}

async function create() {
    const container = await containerBootstrap();
    container.use(NluNeural);
    container.use(LangPt);

    const manager = new DomainManager({ container, trainByDomain: false });

    addFoodDomain(manager);

    await manager.train();

    return manager;
};

module.exports = {
    create,
}