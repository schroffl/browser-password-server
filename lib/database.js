'use strict';

const crypto = require('crypto');
const lowdb = require('lowdb');
const path = require('path');

const dataPath = path.resolve(__dirname, '..');

const db = lowdb( path.resolve(dataPath, 'data.json') );
const errors = require('./errors');

db
	.defaults({
		'jwt_secret': crypto.randomBytes(16).toString('hex'),
		'users': [ ]
	})
	.write();

const users = db.get('users');


module.exports = {
	'addUser': function(username, password) {
		let exists = module.exports.userExists(username);

		if(exists)
			return Promise.reject(errors.UserExists);

		return new Promise((resolve, reject) => {
			let salt = crypto.randomBytes(32),
				pwHash = crypto.createHash('sha512');

			pwHash.update(salt);
			pwHash.update(password);

			let user = {
				'username': username,
				'password': pwHash.digest('hex'),
				'salt': salt.toString('hex'),
				'entries': [ ]
			};

			users
				.push(user)
				.write();

			resolve(user);
		});
	},
	'userExists': function(username) {
		return users
			.some({ username })
			.value();
	},
	'getUser': function(username) {
		let user = users.find({ username });

		if(!user.value())
			return Promise.reject(errors.UserDoesntExist);
		else
			return Promise.resolve(user);
	},
	'checkPassword': function(user, password) {
		let salt = Buffer.from(user.get('salt').value(), 'hex'),
			pwHash = crypto.createHash('sha512');

		pwHash.update(salt);
		pwHash.update(password);

		return pwHash.digest('hex') === user.get('password').value()
			? Promise.resolve()
			: Promise.reject(errors.IncorrectPassword);
	},
	'addEntry': function(user, data) {
		let id = data.id,
			entryExists = user
			.get('entries')
			.some({ id })
			.value();

		if(entryExists)
			return Promise.reject(errors.EntryExists);

		let entry = {
			'id': id,
			'timestamp': data.timestamp,
			'iv': data.iv,
			'ciphertext': data.ciphertext
		};

		user
			.get('entries')
			.push(entry)
			.write();

		return Promise.resolve(entry);
	},
	'getEntry': function(user, data) {
		let entryExists = user
			.get('entries')
			.some({ id })
			.value();

		if(!entryExists)
			return Promise.reject(errors.EntryDoesntExist);

		let entry = user
			.get('entries')
			.find({ id })
			.value();

		return Promise.resolve(entry);
	},
	'getSecret': function() {
		return db
			.get('jwt_secret')
			.value();
	}
};