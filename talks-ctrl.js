var Sequelize = require('sequelize');
var inSubnet = require('insubnet');

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
	if(!inSubnet.IPv4(req.clientIp, '128.153.0.0/16')) {
		res.sendStatus(500);
		return;
	}

	let sequelize = connectToServer();
	let talksModel = sequelize.import(__dirname + "/talks-model.js");

	// write the new talk to the server
	return talksModel.sync().then(() => {
		// create an instance of the model and save to the db
		talksModel.create({name: req.body.name, type: req.body.type, desc: req.body.desc}, {
			fields: ['id', 'name', 'type', 'desc']
		}).then(data => {
			// reload the talks
			loadTalks(talksModel, res);
		});
	});
};

module.exports.updateTalk = (req, res) => {
	if(!inSubnet.IPv4(req.clientIp, '128.153.0.0/16')) {
		res.sendStatus(500);
		return;
	}

	let sequelize = connectToServer();
	let talksModel = sequelize.import(__dirname + "/talks-model.js");

	return talksModel.sync().then(() => {
		return talksModel.update(
			{ hidden: req.body.hiddenStatus },
			{ where: { id: req.body.talkId }}
		);
	}).then(() => {
		loadTalks(talksModel, res);
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
