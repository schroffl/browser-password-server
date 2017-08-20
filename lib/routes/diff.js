'use strict';

const database = require('../database');
const _ = require('lodash');

function idOnly(entry) {
	return entry.id;
}

function idAndTimestamp(entry) {
	return {
		'id': entry.id,
		'timestamp': entry.timestamp
	};
}

function deleteOnClient(serverData, clientData) {
	let deleteEntries = clientData.added.map(idOnly);

	return deleteEntries;
}



module.exports = function(req, res) {
	let clientData = req.body,
		serverData = req.user.get('entries').value();

	let toDelete = deleteOnClient(serverData, clientData);

	console.log(toDelete);

	return;

	let clientEntries = req.body,
		entries = req.user.get('entries').value();

	let clientIds = clientEntries.map(entry => entry.id),
		ids = entries.map(entry => entry.id);

	let idsAndTimestamps = entries.map(entry => ({ 'id': entry.id, 'timestamp': entry.timestamp }));

	let updateEntries =  _.difference(ids, clientIds)
							.map(id => _.find(entries, { id }));

	let deleteEntries = _.differenceWith(clientEntries, idsAndTimestamps, _.isEqual)
							.map(entry => entry.id);

	res.succeed({ 'update': updateEntries, 'delete': deleteEntries });
};