const { Pool, Client } = require('pg');
const format = require('pg-format');
const path = require("path");
const { promises: { readFile } } = require("fs");
const ClientError = require('../error');

const pool = new Pool();

function query(text, params) {
    return pool.query(text, params);
}

async function readDump(fileName) {
    const fileBuffer = await readFile(path.resolve(__dirname, "dump", fileName));
    return fileBuffer.toString();
}

async function initDb() {
    const migrationText = await readDump("tables.sql");
    const seedText = await readDump("data.sql");
    await query(migrationText);
    await query(seedText);
}

async function findRooms() {
    let rooms = [];
    try {
        rooms = (await query('SELECT num FROM rooms')).rows;
    } catch (e) {
        console.error(e.stack);
        throw new ClientError('List rooms failed');
    }
    return rooms;
}

async function findFreeRooms(startDate, endDate, clientId) {
    let rooms = []
    try {
        const findText = format(`
        SELECT DISTINCT num FROM rooms
            LEFT JOIN reservations ON rooms.id = room_id
            WHERE rooms.id NOT IN 
                (SELECT distinct room_id FROM reservations AS r
                    WHERE (r.start_date, r.end_date) OVERLAPS (DATE %L, DATE %L)) 
                OR client_id = %L
            ORDER BY num ASC
        `, startDate, endDate, clientId);
        rooms = (await query(findText)).rows;
    } catch (e) {
        console.error(e.stack);
        throw new ClientError('Find free rooms failed');
    }

    return rooms;
}

async function reserve(startDate, endDate, isVip, roomId, clientId) {
    let isReserved = false;
    try {
        const reserveQuery = {
            text: 'INSERT INTO reservations(start_date, end_date, vip, room_id, client_id) VALUES($1, $2, $3, $4, $5)',
            values: [startDate, endDate, isVip, roomId, clientId],
        };
        await query(reserveQuery);
    } catch (e) {
        console.error(e.stack);
        const errMsg = e.message;
        const occupiedMsg = 'Room is occupied';
        throw new ClientError(errMsg === occupiedMsg ? occupiedMsg : 'Invalid data for reservation');
    }

    return isReserved;
}

async function deleteReserve(id) {
    let isDeleted = false;
    try {
        const { rowCount } = await query('DELETE FROM reservations WHERE id=$1', [id]);
        isDeleted = rowCount > 0;
    } catch (e) {
        console.error(e.stack);
        throw new ClientError(`Remove reservation ${id}: incorrect input`);
    }

    return isDeleted;
}

async function checkClientExists(id) {
    let isClient = false;
    try {
        const { rows } = await query('SELECT COUNT(*) FROM clients WHERE id=$1', [id]);
        isClient = parseInt(rows[0].count, 10) > 0;
    } catch (e) {
        console.error(e.stack);
        throw new ClientError('Incorrect input');
    }

    return isClient;
}

async function checkRoomExists(id) {
    let isRoom = false;
    try {
        const { rows } = await query('SELECT COUNT(*) FROM rooms WHERE id=$1', [id]);
        isRoom = parseInt(rows[0].count, 10) > 0;
    } catch (e) {
        console.error(e.stack);
        throw new ClientError('Incorrect input');
    }

    return isRoom;
}

module.exports = {
    query,
    initDb,
    findRooms,
    findFreeRooms,
    reserve,
    deleteReserve,
    checkClientExists,
    checkRoomExists
};
