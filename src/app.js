const express = require('express');
const DBController = require('./db/mongoose');
const app = express();

app.use(
    express.urlencoded({ extended: true, limit: '50mb', parameterLimit: 10000 })
);

app.use(
    express.json({
        limit: '50mb',
    })
);

app.get('/', (req, res) => {
    res.sendStatus(200);
});

DBController.initConnection(() => {
    const httpServer = require('http').createServer(app);
    httpServer.listen(3000, () => {
        console.log('Server is Runing on 3000');
    });
});
