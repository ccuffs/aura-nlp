const { dockStart } = require('@nlpjs/basic');
const fs = require('fs');
const chalk = require('chalk');

async function createManager() {
    const dock = await dockStart({ use: ['Basic', 'Qna'] });
    const nlp = dock.get('nlp');

    return nlp;
}

async function process(manager, req) {
    const response = await manager.process('pt', req.params.text);
    return response;
}

async function create(modelPath) {
    const nlp = await createManager();
    
    if (!fs.existsSync(modelPath)) {
        console.log(chalk.bold.red('[ERROR] ') + `Model not found: ${modelPath}.`);
        return;
    }

    nlp.load(modelPath);
    
    return nlp;    
};

async function train(argv) {
    const dataset = argv.dataset;
    const nlp = await createManager();

    if (!fs.existsSync(dataset)) {
        console.log(chalk.bold.red('[ERROR] ') + `Dataaset not found: ${dataset}.`);
        process.exit(1);
    }

    await nlp.addCorpus({ filename: dataset, importer: 'qna', locale: 'pt' });
    await nlp.train();

    nlp.save(argv.output);
}

module.exports = {
    process,
    create,
    train
}