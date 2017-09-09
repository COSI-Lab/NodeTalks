var express = require('express'),
	bodyParser = require('body-parser'),
	talksCtrl = require('./talks-ctrl.js'),
	morgan = require('morgan'),
	requestIp = require('request-ip');

var app = express();

// create a node httpserver using the express app as a backend
var httpserver = require('http').Server(app);

// initalize socket.io object
var io = require('socket.io')(httpserver);

// use jade as the template engine
app.set('view engine', 'pug');

// push anything in the public/ directory to be public facing (angular code && styling)
app.use(express.static('public'));

app.use(requestIp.mw());

// switch the accepted POST content format to JSON
app.use(bodyParser.json());

app.use(morgan('tiny'));

// load the root page
app.get('/', (req, res) => {
	console.log(req.ip);
	res.render('index');
});

// load the root page (including hidden talks)
app.get('/all', (req, res) => {
	res.render('all');
});

app.get('/chrono', (req, res) => {
	res.render('chrono');
})

// api to get talks from the db
app.get('/api/talks', talksCtrl.getTalks);

// api to get all non-hidden talks from the db
app.get('/api/talks/visible', talksCtrl.getVisibleTalks)

// api to push talks into the db
app.post('/api/postTalk', talksCtrl.createTalk);

// api to hide & unhide talks on the site
app.post('/api/hideTalk', talksCtrl.updateTalk);
app.post('/api/unhideTalk', talksCtrl.updateTalk);

// Socket.io code
io.on('connection', socket => {
	
	// When a client sends a update, broadcast it to all other clients
	socket.on('update', data => {
		socket.broadcast.emit('change', data);
	})
});

// start the server
httpserver.listen(3000, () => {
	console.log('Server listening on port 3000, press ctrl-C to quit...');
});
