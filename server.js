const express = require('express')
const config = require('./config.json');
const Brain = require('./src/brain');
const Qna = require('./src/qna');

(async () => {
    const app = express();
    const manager = await Brain.create();
    const qna = await Qna.create();

    app.get('/api/intent/:text', async (req, res) => {
        const actual = await manager.process(req.params.text);
        res.json(actual);
    });

    app.get('/api/qna/:text', async (req, res) => {
        const response = await qna.process('pt', req.params.text);
        res.json(response);
    });

    app.listen(config.server.port, () => {
        console.log(`Example app listening at http://localhost:${config.server.port}`)
    });
})();

