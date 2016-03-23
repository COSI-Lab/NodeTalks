var express = require('express'),
  ipFilter = require('express-ip-filter'),
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

// Limits the page to be accesible on only a specific IP range as declared above
app.use(ipFilter({
  filter: ['*128.153.*'],
  forbidden: 'This site is only available in the 128.153.0.0/24 subnet'
}));

// load the root page
app.get('/', (req, res) => {
	res.render('index');
});

// api to get talks from the db
app.get('/api/talks', talksCtrl.getTalks);

// api to push talks into the db
app.post('/api/postTalk', talksCtrl.createTalk);

// start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000, press ctrl-C to quit...');
});
