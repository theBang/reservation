const { Pool } = require('pg');
const format = require('pg-format');
const path = require("path");
const { promises: { readFile } } = require("fs");

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
    const { rows } = await query('SELECT num FROM rooms');
    return rows;
}

async function findFreeRooms(startDate, endDate) {
    const rooms = []
    try {
        const findText = format(`
        SELECT num FROM rooms
            WHERE rooms.id NOT IN 
                (SELECT distinct room_id FROM reservations AS r
                    WHERE (r.start_date, r.end_date) OVERLAPS (DATE %L, DATE %L)) 
    `, startDate, endDate);
        rooms = (await query(findText)).rows;
    } catch(e) {
        throw Error("Find free rooms failed");
    }
    
    return rooms;
}

module.exports = {
    query,
    initDb,
    findRooms,
    findFreeRooms
};
