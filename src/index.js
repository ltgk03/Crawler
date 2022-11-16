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
app.use(express.urlencoded());
app.use(express.json());
// Middleware
//app.use(morgan('combined'));
// Template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/resources/views'));

app.get('/', function (req, res) {
    res.render('index'); 
});

app.post('/crawl', function (req, res) {    
    console.log("Here");
    if (helper.isValidUrl(req.body.q)) {
        helper.run(req.body.q).then((result) =>res.render('crawl', {data: result})).catch((err) => console.error(err));
    } else {
        res.redirect('/');
    }
});
                                                                                                                                                                                  
app.listen(port, () => console.log(`Listen on ${port}`));