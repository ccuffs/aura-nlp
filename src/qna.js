const { dockStart } = require('@nlpjs/basic');

async function create() {
    const dock = await dockStart({ use: ['Basic', 'Qna'] });
    const nlp = dock.get('nlp');
    await nlp.addCorpus({ filename: './data/train/perguntas.tsv', importer: 'qna', locale: 'pt' });
    await nlp.train();

    return nlp;

    //         const response = await qna.process('pt', req.params.text);
};

module.exports = {
    create,
}