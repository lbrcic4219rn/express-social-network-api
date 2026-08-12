const {User} = require('../models');
const joi = require("joi");
const apiRouter = require('../middleware/api-router');
const requireOwner = require('../middleware/ownership');
const {usernameParam, validateParams, validateBody, destroyEntity} = require('../middleware/crud');

const route = apiRouter();

const OWNER_OPTS = {param: 'username', key: 'username', ownerField: 'username'};

function withoutPassword(user) {
    const {password, ...rest} = user.toJSON()
    return rest
}

route.get('/users', (req, res) => {
    User.findAll()
        .then(
            rows => res.json(rows.map(withoutPassword))
        )
        .catch(
            err => {
                console.error(err);
                res.status(500).json({msg: "internal server error"})
            }
        )
})

route.get('/users/:username', (req, res) => {
    const schema = joi.object({
        username: joi.string().required(),
    })
    const {error} = schema.validate({
        username: req.params.username,
    })
    if (error)
        return res.status(400).json({msg: error.message})
    const where = {username: req.params.username}

    User.findOne({where})
        .then(
            usr => {
                if (usr === null)
                    return res.status(404).json({msg: "not found"})
                res.json(withoutPassword(usr))
            }
        )
        .catch(
            err => {
                console.error(err);
                res.status(500).json({msg: "internal server error"})
            }
        )
})

route.put('/users/:username',
    validateParams(usernameParam),
    validateBody(joi.object({
        bio: joi.string().required(),
        profilePicture: joi.string().required(),
    })),
    requireOwner(User, OWNER_OPTS),
    async (req, res) => {
        try {
            req.entity.set('bio', req.body.bio)
            req.entity.set('profilePicture', req.body.profilePicture)
            res.json(withoutPassword(await req.entity.save()))
        } catch (err) {
            console.error(err)
            res.status(500).json({msg: "internal server error"})
        }
    })

route.delete('/users/:username',
    validateParams(usernameParam),
    requireOwner(User, OWNER_OPTS),
    destroyEntity)

module.exports = route;