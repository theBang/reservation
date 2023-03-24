require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/rooms', (req, res) => {
    res.send('All rooms');
});

app.get('/rooms/free/:start/:end', (req, res) => {
    res.send(`Free rooms from ${req.params.start} to ${req.params.end}`);
});

app.post('/reserve', (req, res) => {
    res.send('Resrve room');
})

app.delete('/reserve', (req, res) => {
    res.send('Remove reservation');
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});