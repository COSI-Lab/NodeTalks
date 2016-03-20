var express = require('express'),
  ipfilter = require('express-ipfilter'),
  bodyParser = require('body-parser'),
  talksCtrl = require('./talks-ctrl.js');

var app = express();

// TODO: Change to 128.153.0.0 when put onto Dubsdot
var ips = ['192.168.1.1', '192.168.1.255', '::1'];

// use jade as the template engine
app.set('view engine', 'jade');

// push anything in the public/ directory to be public facing (angular code && styling)
app.use(express.static('public'));

// switch the accepted POST content format to JSON
app.use(bodyParser.json());

// Limits the page to be accesible on only a specific IP range as declared above
app.use(ipfilter(ips, {
  mode: 'allow',
  errorMessage: 'This site is only available in the 128.153.0.0/24 subnet'
}));

// load the root page
app.get('/', function(req, res) {
	res.render('index');
});

// api to get talks from the db
app.get('/api/talks', talksCtrl.getTalks);

// api to push talks into the db
app.post('/api/postTalk', talksCtrl.createTalk);

// start the server
app.listen(3000, function() {
	console.log('Server listening on port 3000, press ctrl-C to quit...');
});
