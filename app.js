const express = require('express'),
    path = require('path'),
    app = express(),
    mongoose = require('mongoose'),
    config = require('./config/database'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    expressValidator = require('express-validator')
    fileUpload = require('express-fileupload')

//connect to mongo DB
mongoose.connect(config.database);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MonogDB')
});

//view engine setup
app.set('view engine',path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//Static folder setup
app.use(express.static(path.join(__dirname, 'public')))

//Express file upload middelware
app.use(fileUpload())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Express Session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
    //  cookie: { secure: true }
}));

/// Express Validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        }
    },

    customValidators : {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase()
            switch (extension){
                case '.jpg': return '.jpg'
                case '.jpeg': return '.jpeg'
                case '.png': return '.png'
                case '': return '.jpg'
                default: return false
            }
        }
    }
}))

// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//Routes Steup
const pages = require('./routes/pages'),
    adminPages = require('./routes/admin_pages'),
    adminCategories = require('./routes/admin_categories')
    adminProducts = require('./routes/admin_products')

app.use('/admin/pages', adminPages)
app.use('/admin/categories', adminCategories)
app.use('/admin/products', adminProducts)
app.use('/', pages)

//Set global errors variable
app.locals.errors = null;

//Start the server
const port = 3000
app.listen(port, () => console.log('Server running on port ' + port))