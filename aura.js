#!/usr/bin/env node

const server = require('./src/server');
const train = require('./src/train');

var argv = require('yargs/yargs')(process.argv.slice(2))
.usage('Usage: $0 <command> [options]')

// Servidor para receber requisições (e dar respostas com base nos modelos)
.command('serve', 'Inicia o servidor', {
    '--port': {
        alias: 'p',
        default: 3000,
        describe: 'Porta do servidor'
    },
    '--engines': {
        alias: 'e',
        default: 'domain:./data/models/domain.model,qna:./data/models/qna.model',
        describe: 'Engines que serão carregadas e disponibilizadas no servidor'
    }    
}, function (argv) { server.create(argv) })

// Processo de treinamento de novos modelos
.command('train', 'Treina um modelo em específico', {
    '--type': {
        alias: 't',
        default: 'domain',
        describe: 'Tipo de modelo a ser treinado. Disponíveis: domain, qna.'
    },
    '--dataset': {
        alias: 'd',
        default: './data/train/aura-domain.tsv',
        describe: 'Arquivo com os dados de treino'
    },
    '--output': {
        alias: 'o',
        default: './data/models/domain.model',
        describe: 'Caminho onde o modelo treinado será escrito.'
    },    
}, function (argv) { train.run(argv) })

// Exemplos de utilização da linha de comando principal
.example('$0 server -p 3000', 'Inicia o servidor com engines default')
.example('$0 server -p 3000', 'inicia o servidor')

// Informações gerais sobre o programa
.help('h')
.alias('h', 'help')
.epilog('(c) 2021 - Aura NLP | github.com/ccuffs/aura-nlp')
.argv;