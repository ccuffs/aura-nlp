const { dockStart } = require('@nlpjs/basic');
const config = require('./config.json');

(async () => {
    const dock = await dockStart(config);
    const nlp = dock.get('nlp');
    await nlp.train();
})();
