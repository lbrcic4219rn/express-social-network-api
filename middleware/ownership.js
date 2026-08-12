const {User} = require('../models');

function requireOwner(Model, {param = 'id', key = 'id', ownerField = 'userID'} = {}) {
    return async (req, res, next) => {
        try {
            const entityWhere = {[key]: req.params[param]}
            const entity = await Model.findOne({where: entityWhere})
            if (entity === null)
                return res.status(404).json({msg: "not found"})

            const userWhere = {username: req.usr.username}
            const user = await User.findOne({where: userWhere})

            if (!(user && (user.get('admin') || entity.get(ownerField) === req.usr.username)))
                return res.status(401).json({msg: "not authorized"})

            req.entity = entity
            next()
        } catch (err) {
            console.error(err)
            res.status(500).json({msg: "internal server error"})
        }
    }
}

module.exports = requireOwner;
