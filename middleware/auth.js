const jwt = require("jsonwebtoken");
require('dotenv').config({quiet: true});

function authToken(req, res, next) {
    if (req.method === "GET") {
        next()
        return
    }
    const authHeader = req.headers['authorization']
    if (authHeader === undefined) return res.status(401).json({msg: "not authorized"})
    const token = authHeader.split(' ')[1]

    if (!token) return res.status(401).json({msg: "not authorized"})

    try {
        req.usr = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    } catch (err) {
        return res.status(403).json({msg: "invalid token"})
    }
    next()
}

module.exports = authToken;
