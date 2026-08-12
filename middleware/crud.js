const joi = require("joi");

const idParam = joi.object({id: joi.number().min(1).required()});
const usernameParam = joi.object({username: joi.string().required()});

function validateParams(schema) {
    return (req, res, next) => {
        const {error} = schema.validate(req.params)
        if (error) return res.status(400).json({msg: error.message})
        next()
    }
}

function validateBody(schema) {
    return (req, res, next) => {
        const {error} = schema.validate(req.body, {allowUnknown: true})
        if (error) return res.status(400).json({msg: error.message})
        next()
    }
}

function updateEntity(fields) {
    return async (req, res) => {
        try {
            for (const field of fields) req.entity.set(field, req.body[field])
            res.json(await req.entity.save())
        } catch (err) {
            console.error(err)
            res.status(500).json({msg: "internal server error"})
        }
    }
}

async function destroyEntity(req, res) {
    try {
        res.json(await req.entity.destroy())
    } catch (err) {
        console.error(err)
        res.status(500).json({msg: "internal server error"})
    }
}

module.exports = {idParam, usernameParam, validateParams, validateBody, updateEntity, destroyEntity};
