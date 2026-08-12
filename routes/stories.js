const {Story} = require('../models');
const joi = require("joi");
const apiRouter = require('../middleware/api-router');
const requireOwner = require('../middleware/ownership');
const {idParam, validateParams, validateBody, updateEntity, destroyEntity} = require('../middleware/crud');

const route = apiRouter();

route.get('/stories', (req, res) => {
    Story.findAll()
        .then(
            rows => res.json(rows)
        )
        .catch(
            err => {
                console.error(err);
                res.status(500).json({msg: "internal server error"})
            }
        )
})

route.get('/stories/:id', (req, res) => {
    const schema = joi.object({
        id: joi.number().min(1).required(),
    })
    const {error} = schema.validate({
        id: req.params.id,
    })
    if (error)
        return res.status(400).json({msg: error.message})

    Story.findOne({
        where: {
            id: req.params.id,
        },
    })
        .then(
            rows => res.json(rows)
        )
        .catch(
            err => {
                console.error(err);
                res.status(500).json({msg: "internal server error"})
            }
        )
})

route.get('/stories/users/:userID', (req, res) => {
    const schema = joi.object({
        id: joi.string().required(),
    })
    const {error} = schema.validate({
        id: req.params.userID,
    })
    if (error)
        return res.status(400).json({msg: error.message})
    Story.findAll({
        where: {
            userID: req.params.userID,
        },
    })
        .then(
            rows => res.json(rows)
        )
        .catch(
            err => {
                console.error(err);
                res.status(500).json({msg: "internal server error"})
            }
        )
})

route.post('/stories', (req, res) => {
    const schema = joi.object({
        data: joi.string().required(),
    })
    const {error} = schema.validate({
        data: req.body.data,
    })
    if (error)
        return res.status(400).json({msg: error.message})
    Story.create({
        userID: req.usr.username,
        data: req.body.data,
    })
        .then(
            rows => res.json(rows)
        )
        .catch(
            err => {
                console.error(err);
                res.status(500).json({msg: "internal server error"})
            }
        )
})

route.put('/stories/:id',
    validateParams(idParam),
    validateBody(joi.object({data: joi.string().required()})),
    requireOwner(Story),
    updateEntity(['data']))

route.delete('/stories/:id',
    validateParams(idParam),
    requireOwner(Story),
    destroyEntity)

module.exports = route;