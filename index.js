//server imports
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const {
    Pool,
    Client
} = require('pg');

//initalize serverss
const app = express();
const port = config.port;

// create application/json parser
app.use(bodyParser.urlencoded({
    extended: false,
    limit: '500mb'
}));

//pg db config
const client = new Client({
    connectionString: config.db,
})
client.connect()
app.set('client', client);

//Serving static files
app.use(express.static('./public'))
app.use(express.static(path.join(__dirname, './weights')))

//defined route
app.use('/', express.static(path.join(__dirname, 'public')))
const routes = require('./routes');
app.use('/', routes);

//enable server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
});