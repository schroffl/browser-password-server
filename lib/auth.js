'use strict';

const jwt = require('jsonwebtoken');
const typecheck = require('json-typecheck');
const database = require('./database');
const errors = require('./errors');

const secret = database.getSecret();

const requestTemplate = {
	'username': 'string',
	'password': 'string'
};

module.exports.login = function(req, res) {
	try {
		typecheck(req.body, requestTemplate);
	} catch(err) {
		return res.fail(err.message, true);
	}

	let username = req.body.username,
		password = req.body.password;

	database
		.getUser(username)
		.then(user => database.checkPassword(user, password))
		.then(() => {
			let now = Math.floor(Date.now() / 1000),
				payload = { username },
				options = { 'expiresIn': '1h' };

			res.succeed({ 
				'token': jwt.sign(payload, secret, options) 
			});
		})
		.catch(res.fail);
};

module.exports.register = function(req, res, next) {
	try {
		typecheck(req.body, requestTemplate);
	} catch(err) {
		return res.fail(err.message, true);
	}

	let username = req.body.username,
		password = req.body.password;

	database
		.addUser(username, password)
		.then(() => next())
		.catch(res.fail);
};

module.exports.protect = function(req, res, next) {
	let token = req.headers.token;

	if(!token)
		return res.fail(errors.InvalidToken);

	jwt.verify(token, secret, (err, payload) => {
		if(err)
			res.fail(errors.InvalidToken);
		else {
			database
				.getUser(payload.username)
				.then(user => req.user = user)
				.then(() => next());
		}
	});
};