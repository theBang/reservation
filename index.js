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

    app.get('/rooms/free', jsonParser, asyncCall(async (req, res) => {
        const { startDate, endDate, clientId } = req.body;

        res.send(await db.findFreeRooms(startDate, endDate, clientId));
    }));

    app.post('/reserve', jsonParser, asyncCall(async (req, res) => {
        const { startDate, endDate, roomId, clientId } = req.body;
        await db.reserve(startDate, endDate, roomId, clientId)
        res.send(`Reserved from ${startDate} to ${endDate}, room ID: ${roomId}, client ID: ${clientId}`);
    }));

    app.delete('/reserve/:id', asyncCall(async (req, res) => {
        const { id } = req.params;
        const isDeleted = await db.deleteReserve(id);
        let status = 200;
        let message = `Reservation ${id} was removed`;
        if (!isDeleted) {
            status = 404;
            message = `Reservation ${id} was not found`;
        }
        res.status(status).send(message);
    }));

    app.use((err, req, res, next) => {
        console.error(err.stack)
        res.status(500).send(err.message || 'Something broke!')
    });

    app.listen(PORT, () => {
        console.log(`Example app listening on port ${PORT}`);
    });
}

if (process.argv[2] === "--migrate") {
    db.initDb()
        .then(startServer)
        .catch(e => {
            console.error('DB migrate failed');
            console.error(e.message);
            console.error(e.stack);
        });
} else {
    startServer();
}