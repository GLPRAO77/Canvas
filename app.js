// using the http module
var express = require('express');
var app = express();
(bodyParser = require('body-parser')), (CryptoJS = require('crypto-js'));
const path = require('path');

//Get the signed request parser
var decode = require('./parse-signed-request.js');

//Content
app.use('/views', express.static(path.join(__dirname, 'views')));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ entended: true }));

// look for PORT environment variable,
// else look for CLI argument,
// else use hard coded value for port 8080
const port = process.env.PORT || process.argv[2] || 8080;
var consumerSecret = process.env.CANVAS_CONSUMER_SECRET;

//Define request response in root URL (/)
app.get('/', function (req, res) {
    res.json({
        context: 'Welcome to the Sample Canvas back-end API. Please refer to the links for further calls.',
        links: [{ name: 'canvas-demo', href: '/canvas-demo/' }],
    });
    res.end();
});

//Return for the fixed page
app.get('/canvas-demo/', function (req, res) {
    //alert('1');
    console.log('b64Hash--1');
    res.render('index', { context: '', url: process.env.IMAGE_URL });
});

//Signed request for canvas app
app.post('/canvas-demo/', function (req, res) {
    //alert('1');
    var signed_req = req.body.signed_request;
    var hashedContext = signed_req.split('.')[0];

    var context = signed_req.split('.')[1];
    var hash = CryptoJS.HmacSHA256(context, consumerSecret);
    var b64Hash = CryptoJS.enc.Base64.stringify(hash);
    console.log('b64Hash--' + b64Hash);
    if (hashedContext === b64Hash) {
        //Decode context
        body = JSON.stringify(req.body);
        data = JSON.stringify(res.data);
        console.log('data--' + data);

        signed_request = JSON.parse(body)['signed_request'];

        var json = decode(signed_request, process.env.CANVAS_CONSUMER_SECRET);

        //res.send(json.context.environment.parameters.objectName);
        //res.render('index', { context: json, url: process.env.IMAGE_URL });
        if (json.context.environment.parameters.objectName == 'Home') {
            //res.send('came1');
            res.render('index', { context: json, url: process.env.IMAGE_URL });
        } else if (json.context.environment.parameters.objectName == 'Account') {
            res.send('Account');
            //res.send('came2');
            //res.render('account', { context: json, url: process.env.IMAGE_URL });
        }
        //Render and pass
        //res.render('index', { context: json, url: process.env.IMAGE_URL });
    } else {
        res.send('Canvas authentication failed');
    }
});

//Launch listening server on port Heroku-capable port
app.listen(port, function () {
    console.log('App listening as would be expected!');
});

//Export for tests
module.exports = app;
