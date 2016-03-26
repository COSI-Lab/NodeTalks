var express = require('express'),
  ipFilter = require('express-ipfilter'),
  bodyParser = require('body-parser'),
  talksCtrl = require('./talks-ctrl.js'),
  morgan = require('morgan');

var app = express();

// use jade as the template engine
app.set('view engine', 'jade');

// push anything in the public/ directory to be public facing (angular code && styling)
app.use(express.static('public'));

// switch the accepted POST content format to JSON
app.use(bodyParser.json());

app.use(morgan('tiny'));

var ips = [['128.153.0.0', '128.153.255.255']];

// Limits the page to be accesible on only a specific IP range as declared above
app.use(ipFilter(ips, {
  mode: 'allow'
}));
// load the root page
app.get('/', (req, res) => {
	console.log(req.ip);
	res.render('index');
});

app.get('/all', (req, res) => {
	res.render('all');
});


// api to get talks from the db
app.get('/api/talks', talksCtrl.getTalks);

// api to push talks into the db
app.post('/api/postTalk', talksCtrl.createTalk);

// api to hide & unhide talks on the site
app.post('/api/hideTalk', talksCtrl.updateTalk);
app.post('/api/unhideTalk', talksCtrl.updateTalk);

// start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000, press ctrl-C to quit...');
});
