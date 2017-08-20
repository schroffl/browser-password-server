'use strict';

const errors = require('./errors');
const messages = Object.keys(errors).map(key => errors[key]);

module.exports = function(req, res, next) {

	res.succeed = data => {
		let obj = Object.assign({ 'success': true }, data);

		res.json(obj);
	};

	res.fail = (err, justDoIt) => {
		// We don't want any unexpected failures to get through to the client
		if(justDoIt !== true && !messages.includes(err))
			err = errors.InternalError;

		res.json({ 'success': false, 'error': err.toString() });
	};

	next();
};