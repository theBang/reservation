require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.CHECKPORT || 3001;
 
app.use(cors());
 
app.get('/check', function (req, res, next) {
  res.send(Math.random() > 0.5);
});

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send(err.message || 'Something broke!')
});
 
app.listen(PORT, function () {
  console.log(`Check VIP user on port: ${PORT}`)
});