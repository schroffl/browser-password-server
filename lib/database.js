'use strict';

const path = require('path');
const crypto = require('crypto');

const dbFilePath = path.resolve(__dirname, '..', 'data.json');

const lowdb = require('lowdb');
const db = lowdb(dbFilePath);

db
	.defaults({
		'jwt_secret': crypto.randomBytes(16).toString('hex'),
		'users': [ ]
	})
	.write();

const users = db.get('users');

const errors = {
	'UserExists': 'User already exists'
};

module.exports = {
	'createUser': function(username, password) {
		let exists = module.exports.exists(username);

		return new Promise((resolve, reject) => {
			if(exists)
				return reject(errors.UserExists);

			let salt = crypto.randomBytes(32),
				pwHash = crypto.createHash('sha512');

			pwHash.update(salt);
			pwHash.update(password);
		});
	},
	'getUser': function(username) {
		return users
			.find({ username });
	},
	'exists': function(username) {
		return users
			.some({ username })
			.value();
	}

};

module.exports.createUser('test', '123456');