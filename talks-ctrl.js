var Sequelize = require('sequelize');
var inSubnet = require('insubnet');
var { createLogger, format, transports } = require('winston');
var { combine, timestamp, label, printf } = format;
var meetingPassword = require('./meeting-password.json')


var myFormat = printf(info => {
	return `${info.timestamp} ${info.level}: ${info.message}`;
})

var logger = createLogger({
	level: 'info',
	transports: [
		new transports.Console(),
		new transports.File({ filename: './public/log/talks.log' })
	],
	format: combine(
		timestamp(),
		myFormat
	)
});

module.exports.getTalks = (req, res) => {
	let sequelize = connectToServer();
	let talksModel = sequelize.import(__dirname + "/talks-model.js");
	loadTalks(talksModel, res);
};

module.exports.getVisibleTalks = (req, res) => {
	let sequelize = connectToServer();
	let talksModel = sequelize.import(__dirname + "/talks-model.js");
	loadVisibleTalks(talksModel, res);
}

module.exports.createTalk = (req, res) => {
	if(!allowed(req)) {
		res.sendStatus(500);
		return;
	}

	let sequelize = connectToServer();
	let talksModel = sequelize.import(__dirname + "/talks-model.js");

	// write the new talk to the server
	return talksModel.sync().then(() => {
		const { name, type, desc } = req.body;
		// create an instance of the model and save to the db
		talksModel.create({name, type, desc}, {
			fields: ['id', 'name', 'type', 'desc']
		}).then(data => {
			logger.log({
				level: 'info',
				message: `[CREATE] ${name} created a ${type} with the description: ${desc}`
			});

			// reload the talks
			loadTalks(talksModel, res);
		});
	});
};

module.exports.updateTalk = (req, res) => {
	if(!allowed(req)) {
		res.sendStatus(500);
		return;
	}

	let sequelize = connectToServer();
	let talksModel = sequelize.import(__dirname + "/talks-model.js");

	return talksModel.sync().then(() => {
		const { hiddenStatus, talkId } = req.body;

		return talksModel.update(
			{ hidden: hiddenStatus },
			{ where: { id: talkId }}
		);
	}).then(() => {
		return talksModel.find({
			attributes: ['id', 'name', 'type', 'desc', 'hidden'],
			where: { id: req.body.talkId }
		}).then(data => {
			const talk = data.dataValues;

			logger.log({
				level: 'info',
				message: `[UPDATE] The ${talk.type} "${talk.desc}" by ${talk.name} was ${talk.hidden ? 'hidden': 'unhidden'}`
			});

			loadTalks(talksModel, res);
		})
	});
};

// Send a SELECT query to the database and return the response as JSON
function loadTalks(model, res) {
	return model.findAll({
		attributes: ['id', 'name', 'type', 'desc', 'hidden']
	}).then(result => {
		return res.json(result);
	});
}

function loadVisibleTalks(model, res) {
	return model.findAll({
		attributes: ['id', 'name', 'type', 'desc', 'hidden'],
		where: {hidden: false}
	}).then(result => {
		return res.json(result);
	});
}

function connectToServer() {
	return new Sequelize('database', 'username', 'password', {
		dialect: 'sqlite',
		storage: './talks.db'
	});
}

function allowedIP(req) {
	return inSubnet.IPv4(req.ip, '128.153.0.0/16');
}

function validPassword(req) {
	if (!meetingPassword || !meetingPassword.password) {
		return false;
	}

	return req.body.password == meetingPassword.password;
}

function allowed(req) {
	return allowedIP(req) || validPassword(req);
}
