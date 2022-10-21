const path = require('path');
const express = require('express');
const ejs = require('ejs');
const helper = require('./crawl');
const morgan = require('morgan');

const app = express();
const port = 3000;
app.use(express.static('public'));
app.use(express.static('css'));
app.use(express.static('js'));
// Middleware
app.use(morgan('combined'));
app.use(express.urlencoded);
// Template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/resources/views'));

app.get('/', async function (req, res) {
    if (helper.isValidUrl(req.query.q)) {
        await helper.run(req.query.q).then((result) => res.render('index', {data: result}));     
    } else {
        const dat = [];
        res.render('index', {data: dat});
    }      
});

                                                                                                                                                                                         
app.listen(port, () => console.log(`Listen on ${port}`));