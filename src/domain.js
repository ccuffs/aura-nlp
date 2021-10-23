const { NlpManager } = require('node-nlp');
const fs = require('fs');
const chalk = require('chalk');

async function createManager() {
    const manager = new NlpManager({ languages: ['pt'], autoSave: false });
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

function addTrainingPiece(manager, entry, path) {
    const type = entry.type.toLowerCase();

    if (type.length === 0) {
        return;
    }

    if (type == 'ner') {
        manager.addNamedEntityText(
            entry.category,
            entry.nickname,
            [entry.language],
            splitAndTrim(entry.content, ',')
        );

        console.debug(`[DEBUG] Training piece [${path}]: ${type} (${entry.language}) -> ${entry.category} / ${entry.nickname}`);

    } else if (type == 'doc' || type == 'question' || type == 'answer') {
        if (type == 'answer') {
            manager.addAnswer(entry.language, entry.category, entry.content);
        } else {
            manager.addDocument(entry.language, entry.content, entry.category);
        }

        console.debug(`[DEBUG] Training piece [${path}]: ${type} (${entry.language}) -> ${entry.category} / ${entry.content}.`);

    } else {
        console.log(chalk.yellow.bold('[WANR] ') + `Training piece of [${path}] has unknown type: ${type}`);
    }
}

function readDirectory(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}

async function loadDatasets(path) {
    const isDir = fs.lstatSync(path).isDirectory();

    if (!isDir) {
        return [path];
    }

    console.log(chalk.blueBright('[INFO] ') + 'Training path ' + chalk.yellow(path) + ' is a directory, multiple files will be used.');

    var datasets = await readDirectory(path);
    datasets = datasets.map(dataset => {
        return path + '/' + dataset;
    });

    return datasets;
}

async function train(argv) {
    const path = argv.dataset;
    
    if (!fs.existsSync(path)) {
        console.log(chalk.bold.red('[ERROR] ') + `Path not found: ${path}`);
        return;
    }

    var manager = await createManager();
    var datasets = await loadDatasets(path);

    console.log(chalk.blueBright('[INFO] ') + 'Files used for trainig: ' + chalk.yellow(datasets.join(', ')));

    await Promise.all(datasets.map(async (dataset) => {
        return new Promise((resolve, reject) => {
            var header = [];
            const stream = fs.createReadStream(dataset);
    
            stream.on('data', async function(data) {
                var lines = data.toString().split('\n');
    
                for(var i = 0; i < lines.length; i++) {
                    var lineParts = splitAndTrim(lines[i]);
    
                    if (header.length === 0) {
                        header = lineParts;
                        continue;
                    }
    
                    try {
                        addTrainingPiece(manager, {
                            type: lineParts[0],
                            category: lineParts[1],
                            nickname: lineParts[2],
                            language: lineParts[3],
                            content: lineParts[4],
                        }, dataset);
                    } catch (e) {
                        console.log(chalk.red.bold('[ERROR] ') + `Invalid training piece (${dataset} at line ${i}) [${lineParts}]. ` + e);
                    }
                }
            }); 
    
            stream.on('end', async function() {
                resolve();
            });
        });
    }));

    await manager.train();
    manager.save(argv.output);
}

module.exports = {
    process,
    train,
    create,
}