require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;
const jsonParser = bodyParser.json();

function asyncCall(callback) {
    return function (req, res, next) {
        callback(req, res, next).catch(next);
    }
}

function startServer() {
    app.get('/rooms', asyncCall(async (req, res) => {
        res.json(await db.findRooms());
    }));

    app.get('/rooms/free/:startDate/:endDate', asyncCall(async (req, res) => {
        const { startDate, endDate } = req.params;

        res.send(await db.findFreeRooms(startDate, endDate));
    }));

    app.post('/reserve', jsonParser, (req, res) => {
        res.send(`Resrve room ${JSON.stringify(req.body)}`);
    })

    app.delete('/reserve', (req, res) => {
        res.send('Remove reservation');
    })

    app.use((err, req, res, next) => {
        console.error(err.stack)
        res.status(500).send(err.message || 'Something broke!')
    })

    app.listen(PORT, () => {
        console.log(`Example app listening on port ${PORT}`);
    });
}

if (process.argv[2] === "--migrate") {
    db.initDb()
        .then(startServer)
        .catch(() => {
            console.error('DB migrate failed');
        });
} else {
    startServer();
}