const {Post, Post_Tag} = require('../models');
const joi = require("joi");
const apiRouter = require('../middleware/api-router');

const route = apiRouter();

route.get('/tags/posts/:tagName', async (req, res) => {
    const schema = joi.object({
        tagName: joi.string().required(),
    })
    const {error} = schema.validate({
        tagName: req.params.tagName
    })
    if (error)
        return res.status(400).json({msg: error.message})
    try {
        const links = await Post_Tag.findAll({
            where: {
                tagName: req.params.tagName
            }
        })
        const postIDs = links.map(el => el.get('postID'))

        const posts = await Post.findAll({
            where: {
                id: postIDs
            }
        })

        res.json(posts)
    } catch (err) {
        console.error(err)
        res.status(500).json({msg: "internal server error"})
    }

})

module.exports = route;