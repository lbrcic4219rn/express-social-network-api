const express = require('express');
const authToken = require('./auth');

function apiRouter() {
    const route = express.Router();
    route.use(express.json());
    route.use(express.urlencoded({extended: true}));
    route.use(authToken);
    return route;
}

module.exports = apiRouter;
