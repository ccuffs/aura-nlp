/**
 * Esse arquivo é responsável por coordenar os processos de treinamento.
 * Aqui são definidos quais são os tipos de modelos/engines disponíveis
 * e como elas são chamadas.
 * 
 * @author Fernando Bevilacqua <fernando.bevilacqua@uffs.edu.br>
 */

const chalk = require('chalk');

const { availableEngines } = require('./engines');

async function run(argv) {
    const engine = availableEngines[argv.type];

    if (engine == undefined) {
        console.log(chalk.bold.red('[ERROR] ') + `unknown training type: ${argv.type}.`);
        process.exit(1);
    }

    console.log(chalk.blueBright('[INFO] ') + 'Train start for ' + chalk.yellow(argv.type));

    await engine.train(argv);

    console.log(chalk.blueBright('[INFO] ') + 'Train complete: ' +  chalk.yellow(`${argv.type} -> ${argv.output}`));
}

module.exports = {
    run,
}