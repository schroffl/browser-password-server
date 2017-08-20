'use strict';

const http = require('http');
const express = require('express');

const router = express();
const server = http.createServer(router);

const cors = require('cors');
const bodyParser = require('body-parser');

const auth = require('./lib/auth');

router.use(cors());
router.use(bodyParser.json());

router.use(require('./lib/response-helper'));

router.post('/login', auth.login);
router.post('/register', auth.register, auth.login);

router.use(auth.protect);

router.post('/diff', require('./lib/routes/diff'));

server.listen(80, '0.0.0.0', () => console.log('Listening on port 80'));
