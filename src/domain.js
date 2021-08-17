const { NlpManager } = require('node-nlp');
const fs = require('fs');
const chalk = require('chalk');

async function createManager() {
    const manager = new NlpManager({ languages: ['en'], autoSave: false });
    return manager;
}

async function process(manager, req) {
    const response = await manager.process(req.params.text);
    return response;
}

async function create(modelPath) {
    const manager = await createManager();
    
    if (!fs.existsSync(modelPath)) {
        console.log(chalk.bold.red('[ERROR] ') + `Model not found: ${modelPath}.`);
        return;
    }

    manager.load(modelPath);
    
    return manager;
};

async function train(argv) {
    const manager = await createManager();

    manager.addNamedEntityText(
        'hero',
        'spiderman',
        ['en'],
        ['Spiderman', 'Spider-man'],
    );
    manager.addNamedEntityText(
        'hero',
        'iron man',
        ['en'],
        ['iron man', 'iron-man'],
    );
    manager.addNamedEntityText('hero', 'thor', ['en'], ['Thor']);
    manager.addNamedEntityText(
        'food',
        'burguer',
        ['en'],
        ['Burguer', 'Hamburguer'],
    );
    manager.addNamedEntityText('food', 'pizza', ['en'], ['pizza']);
    manager.addNamedEntityText('food', 'pasta', ['en'], ['Pasta', 'spaghetti']);
    manager.addDocument('en', 'I saw %hero% eating %food%', 'sawhero');
    manager.addDocument(
        'en',
        'I have seen %hero%, he was eating %food%',
        'sawhero',
    );
    manager.addDocument('en', 'I want to eat %food%', 'wanteat');

    await manager.train();
    manager.save(argv.output);
}

module.exports = {
    process,
    train,
    create,
}