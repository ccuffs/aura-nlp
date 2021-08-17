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

function splitAndTrim(line, delimiter = '\t') {
    return line.split(delimiter).map(item => item.trim());
}

function addTrainingPiece(manager, entry) {
    const type = entry.type.toLowerCase();

    if (type == 'ner') {
        manager.addNamedEntityText(
            entry.category,
            entry.nickname,
            [entry.language],
            splitAndTrim(entry.content, ',')
        );

        console.debug(`[DEBUG] Training piece: ${type} (${entry.language}) -> ${entry.category} / ${entry.nickname}`);

    } else if (type == 'doc') {
        manager.addDocument(entry.language, entry.content, entry.category);
        console.debug(`[DEBUG] Training piece: ${type} (${entry.language}) -> ${entry.category} / ${entry.content}.`);

    } else {
        console.log(chalk.yellow.bold('[WANR] ') + `Training pieces has unknown type: ${type}.`);
    }
}

async function train(argv) {
    const dataset = argv.dataset;
    
    if (!fs.existsSync(dataset)) {
        console.log(chalk.bold.red('[ERROR] ') + `Dataset not found: ${dataset}.`);
        return;
    }

    var header = [];
    var manager = await createManager();    
    const stream = fs.createReadStream(dataset);

    stream.on('data', async function(data) {
        var lines = data.toString().split('\n');

        for(var i = 0; i < lines.length; i++) {
            var lineParts = splitAndTrim(lines[i]);

            if (header.length === 0) {
                header = lineParts;
                continue;
            }

            // TODO: no futuro, podemos deixar isso mais dinânico
            addTrainingPiece(manager, {
                type: lineParts[0],
                category: lineParts[1],
                nickname: lineParts[2],
                language: lineParts[3],
                content: lineParts[4],
            });
        }
    }); 

    stream.on('end', async function() {
        await manager.train();
        manager.save(argv.output);
    });
}

module.exports = {
    process,
    train,
    create,
}