const express = require('express');
const app = express();

var port = 3001;


// //Static Files

app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/img'));


// // Set Views
app.set('views', './views');
app.set('view engine', 'ejs');

// // API
app.get('/', (req, res) => {
    res.render('index');
});
app.listen(port, () => console.info(`Listening on port: ${port}`));