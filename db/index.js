const { Pool } = require('pg');
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

module.exports = { query, initDb, findRooms };
