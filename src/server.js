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

function makeServerApp(engines, argv) {
    var routesLoaded = 0;
    var registeredRoutes = [];
    
    const app = express();

    for(var name in engines) {
        const engine = engines[name];

        if (!engine.instance) {
            console.log(chalk.bold.yellow('[WARN] ') + `Engine "${name}" has no instance.`);
            continue;
        }

        const route = '/api/' + engine.route + '/:text';

        if (registeredRoutes.indexOf(route) !== -1) {
            console.log(chalk.bold.yellow('[WARN] ') + `Route "${route}" already registered.`);
            continue;
        }

        console.log(chalk.blueBright('[INFO] ') + 'Route available: ' + chalk.yellow(route) + ' ' + chalk.green(name));

        app.get(route, async (req, res) => {
            const actual = await engine.module.process(engine.instance, req);
            res.json(actual);
        });
        routesLoaded++;
    }

    if (routesLoaded == 0) {
        console.log(chalk.bold.red('[ERROR] ') + 'No routes loaded. Sure --engines is correct?');
        return;
    }

    app.listen(argv.port, () => {
        console.log(chalk.blueBright('[INFO] ') + 'Server running at ' + chalk.yellow(`http://localhost:${argv.port}`));
    });
}

async function create(argv) {
    var engines = {};
    const requiredEngines = argv.engines.split(',');

    for(var prop in requiredEngines) {
        const requiredInfo = requiredEngines[prop]; // algo como "dominio:rota:/caminho/para/modelo". 
        const parts = requiredInfo.split(':');
        const name = parts[0];
        const route = parts[1];
        const modelPath = parts[2];

        if (availableEngines[name] === undefined) {
            console.log(chalk.bold.red('[ERROR] ') + `Engine "${name}" not found.`);
            process.exit(1);
        }

        engines[name] = {
            name: name,
            route: route,
            modelPath: modelPath,
            module: availableEngines[name],
            instance: await availableEngines[name].create(modelPath),
        };        
    }

    makeServerApp(engines, argv);
}

module.exports = {
    create,
}