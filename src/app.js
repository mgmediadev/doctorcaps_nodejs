const express = require('express');
const morgan  = require('morgan');
const exphbs  = require('express-handlebars');
const fileUpload = require('express-fileupload');
const path    = require('path');
const nodemon = require('nodemon');

const app = express();

//settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

//routes
app.use(require('./routes/index'));

//static files
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;