/**
 * Esse arquivo cria um servidor web para receber requisições referentes aos
 * modelos treinados e prontos para uso. A utilização da aura-nlp é majoritariamente
 * feita via comunicação HTTP.
 * 
 * @author Fernando Bevilacqua <fernando.bevilacqua@uffs.edu.br>
 */

const chalk = require('chalk');
const express = require('express')
const { availableEngines } = require('./engines');

async function create(arvg) {
    var engines = {};
    const requiredEngines = arvg.engines.split(',');

    for(var prop in requiredEngines) {
        const requiredInfo = requiredEngines[prop]; // algo como "dominio:/caminho/para/modelo". 
        const parts = requiredInfo.split(':');
        const name = parts[0];
        const modelPath = parts[1];

        if (availableEngines[name] === undefined) {
            console.log(chalk.bold.red('[ERROR] ') + `Engine "${name}" not found.`);
            process.exit(1);
        }

        engines[name] = {
            name: name,
            modelPath: modelPath,
            instance: await availableEngines[name].create(modelPath),
        };        
    }

    const app = express();

    for(var name in engines) {
        const engine = engines[name];
        const route = '/api/' + name + '/:text';

        console.log(chalk.blueBright('[INFO] ') + 'Route available: ' + chalk.yellow(route) + ' ' + chalk.green(name));

        app.get(route, async (req, res) => {
            const actual = await engine.instance.process(req.params.text);
            res.json(actual);
        });
    }

    app.listen(arvg.port, () => {
        console.log(chalk.blueBright('[INFO] ') + 'Server running at ' + chalk.yellow(`http://localhost:${arvg.port}`));
    });
}

module.exports = {
    create,
}