const express = require("express");
const {sequelize, User} = require('./models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const joi = require("joi");
require('dotenv').config({quiet: true});

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGINS || 'http://localhost:8000,http://127.0.0.1:8000')
    .split(',')
    .map(origin => origin.trim())

const corsOptions = {
    origin: allowedOrigins,
    optionsSuccessStatus: 200,
}

app.use(express.json());
app.use(cors(corsOptions));

const TOKEN_TTL = '1h'

const credentialsSchema = joi.object({
    username: joi.string().alphanum().min(3).max(30).required(),
    password: joi.string().min(8).max(72).required(),
})

function signToken(usr) {
    return jwt.sign(
        {username: usr.get('username'), admin: usr.get('admin')},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: TOKEN_TTL}
    )
}

app.post('/register', (req, res) => {
    const {error, value} = credentialsSchema.validate({
        username: req.body.username,
        password: req.body.password,
    })
    if (error)
        return res.status(400).json({msg: error.message})

    User.create({
        username: value.username,
        password: bcrypt.hashSync(value.password, 10),
    })
        .then(
            rows => res.json({token: signToken(rows)})
        )
        .catch(
            err => {
                console.error(err)
                if (err.name === 'SequelizeUniqueConstraintError')
                    return res.status(409).json({msg: "username already taken"})
                res.status(500).json({msg: "internal server error"})
            }
        )
})

app.post('/login', (req, res) => {
    const {error, value} = credentialsSchema.validate({
        username: req.body.username,
        password: req.body.password,
    })
    if (error)
        return res.status(400).json({msg: "invalid credentials"})

    const where = {username: value.username}

    User.findOne({where})
        .then(
            usr => {
                if (usr && bcrypt.compareSync(value.password, usr.get('password'))) {
                    res.json({token: signToken(usr)})
                } else {
                    res.status(400).json({msg: "invalid credentials"})
                }
            }
        )
        .catch(
            err => {
                console.error(err)
                res.status(500).json({msg: "internal server error"})
            }
        )
})

app.listen({port: 9000}, async () => {
    await sequelize.authenticate();
});
