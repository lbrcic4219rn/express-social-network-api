const express = require("express");
const {sequelize} = require('./models');
const users = require('./routes/users');
const tags = require('./routes/tags')
const posts = require('./routes/posts')
const comments = require('./routes/comments')
const stories = require('./routes/stories')
const path = require('path');
const jwt = require('jsonwebtoken');

require('dotenv').config({quiet: true});

const app = express();

app.use(express.json());

app.use('/api', users);
app.use('/api', tags);
app.use('/api', posts);
app.use('/api', comments);
app.use('/api', stories);


function getCookies(req) {
    if (!req.headers.cookie) return {};

    const rawCookies = req.headers.cookie.split('; ')
    const parsedCookies = {}

    rawCookies.forEach(element => {

        const pc = element.split('=')
        parsedCookies[pc[0]] = pc[1]
    });

    return parsedCookies

}

function authToken(req, res, next) {
    const cookies = getCookies(req)
    const token = cookies['token']

    if (!token) return res.redirect(301, '/login')

    try {
        req.usr = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    } catch (err) {
        return res.redirect(301, '/login')
    }
    next()
}

app.get('/register', (req, res) => {
    res.sendFile("register.html", {root: './static'});
})

app.get('/login', (req, res) => {
    res.sendFile("login.html", {root: './static'});
})

app.get('/', authToken, (req, res) => {
    res.sendFile("index.html", {root: './static'});
})

app.get('/index.html', authToken, (req, res) => {
    res.sendFile("index.html", {root: './static'});
})

app.use(express.static(path.join(__dirname, 'static')));

app.listen({port: 8000}, async () => {
    await sequelize.authenticate();
});
