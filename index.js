require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const bodyParser = require('body-parser');
const validator = require('validator');
const db = require('./db');
const ClientError = require('./error');
const app = express();
const PORT = process.env.PORT || 3000;
const jsonParser = bodyParser.json();

const MSG_PARAM = 'Missing parameters';
const MSG_DATE = 'Invalid dates';
const MSG_UUID = 'Invalid UUID';

function asyncCall(callback) {
    return function (req, res, next) {
        callback(req, res, next).catch(next);
    }
}

function checkValidDates(startDate, endDate) {
    const dateOptions = {
        format: 'YYYY-MM-DD',
        strictMode: true,
        delimeters: ['-']
    };
    const isOkStart = validator.isDate(startDate, dateOptions);
    const isOkEnd = validator.isDate(endDate, dateOptions);
    const isOkRange = validator.isAfter(endDate, startDate);

    return isOkStart && isOkEnd && isOkRange;
}

function startServer() {
    app.get('/rooms', asyncCall(async (req, res) => {
        res.json(await db.findRooms());
    }));

    app.get('/rooms/free', jsonParser, asyncCall(async (req, res) => {
        const { startDate, endDate, clientId } = req.body;

        if (!startDate || !endDate || !clientId) {
            throw new ClientError(MSG_PARAM);
        }

        if (!checkValidDates(startDate, endDate)) {
            throw new ClientError(MSG_DATE);
        }

        if (!validator.isUUID(clientId, 4)) {
            throw new ClientError(MSG_UUID);
        }

        if (!await db.checkClientExists(clientId)) {
            throw new ClientError(`Client ${clientId} does not exist`);
        }

        res.send(await db.findFreeRooms(startDate, endDate, clientId));
    }));

    app.post('/reserve', jsonParser, asyncCall(async (req, res) => {
        const { startDate, endDate, roomId, clientId } = req.body;
        
        if (!startDate || !endDate || !roomId || !clientId) {
            throw new ClientError(MSG_PARAM);
        }

        if (!checkValidDates(startDate, endDate)) {
            throw new ClientError(MSG_DATE);
        }

        if (!validator.isUUID(roomId, 4) || !validator.isUUID(clientId, 4)) {
            throw new ClientError(MSG_UUID);
        }

        if (!await db.checkRoomExists(roomId)) {
            throw new ClientError(`Room ${roomId} does not exist`);
        }

        if (!await db.checkClientExists(clientId)) {
            throw new ClientError(`Client ${clientId} does not exist`);
        }
        
        let isVip = false;

        try {
            const resCheckVip = await superagent.get('http://localhost:3001/check');
            isVip = resCheckVip.body;
        } catch (e) {
            console.log(e);
            throw Error('Check vip failed');
        }

        await db.reserve(startDate, endDate, isVip, roomId, clientId)
        res.send(`Reserved from ${startDate} to ${endDate}, room ID: ${roomId}, client ID: ${clientId}, vip: ${isVip}`);
    }));

    app.delete('/reserve/:id', asyncCall(async (req, res) => {
        const { id } = req.params;
        
        if (!id) {
            throw new ClientError(MSG_PARAM);
        }

        if (!validator.isUUID(id, 4)) {
            throw new ClientError(MSG_UUID);
        }

        const isDeleted = await db.deleteReserve(id);
        let status = 200;
        let message = `Reservation ${id} was removed`;
        if (!isDeleted) {
            status = 404;
            message = `Reservation ${id} was not found`;
        }
        res.status(status).send(message);
    }));

    app.use((req, res) => {
        res.status(404).send('Not Found');
    });

    app.use((err, req, res, next) => {
        let status = 500;
        let msg = 'Something broke!';
        if (err instanceof ClientError) {
            status = err.status;
            msg = err.message;
        } else {
            console.error(err);
        }
        res.status(status).send(msg);
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