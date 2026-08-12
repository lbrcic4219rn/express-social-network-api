const {Post, Tag, Post_Tag, Like} = require('../models');
const joi = require("joi");
const apiRouter = require('../middleware/api-router');
const requireOwner = require('../middleware/ownership');
const {idParam, validateParams, validateBody, destroyEntity} = require('../middleware/crud');

const route = apiRouter();

const postBody = joi.object({
    data: joi.string().required(),
    image: joi.string().required(),
    tags: joi.array().items(joi.string()).required(),
});

route.get('/posts', (req, res) => {
    Post.findAll()
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

route.get('/posts/:id', (req, res) => {
    const schema = joi.object({
        id: joi.number().min(1).required(),
    })
    const {error} = schema.validate({
        id: req.params.id,
    })
    if (error)
        return res.status(400).json({msg: error.message})
    Post.findOne({
        where: {
            id: req.params.id,
        }
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

route.get('/posts/users/:username', (req, res) => {
    const schema = joi.object({
        id: joi.string().required(),
    })
    const {error} = schema.validate({
        id: req.params.username,
    })
    if (error)
        return res.status(400).json({msg: error.message})
    Post.findAll({
        where: {
            userID: req.params.username,
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

route.post('/posts', validateBody(postBody), async (req, res) => {
    try {
        const tags = req.body.tags;
        const newTags = [];
        for (let tag of tags) {
            let foundTag = await Tag.findOne({
                where: {
                    tagName: tag
                }
            })
            if (foundTag === null) {
                foundTag = await Tag.create({
                    tagName: tag
                })
            }
            newTags.push(foundTag)
        }

        const newPost = await Post.create({
            userID: req.usr.username,
            data: req.body.data,
            likeCount: 0,
            image: req.body.image
        })

        for (let tag of newTags) {
            await Post_Tag.create({
                postID: newPost.get('id'),
                tagName: tag.get('tagName'),
            })
        }
        res.json(newPost)
    } catch (err) {
        console.error(err)
        res.status(500).json({msg: "internal server error"})
    }
})

route.put('/posts/:id',
    validateParams(idParam),
    validateBody(postBody),
    requireOwner(Post),
    async (req, res) => {
        try {
            const oldPost = req.entity

            const oldLinks = await Post_Tag.findAll({
                where: {
                    postID: req.params.id
                }
            })
            const oldTags = oldLinks.map(el => el.get('tagName'))

            const newTags = req.body.tags;
            for (let tag of oldTags) {
                const postTag = await Post_Tag.findOne({
                    where: {
                        postID: req.params.id,
                        tagName: tag
                    }
                })
                await postTag.destroy()
            }

            for (let tag of newTags) {
                let foundTag = await Tag.findOne({
                    where: {
                        tagName: tag
                    }
                })
                if (foundTag === null) {
                    foundTag = await Tag.create({
                        tagName: tag
                    })
                }
                await Post_Tag.create({
                    postID: req.params.id,
                    tagName: tag,
                })
            }

            oldPost.set('data', req.body.data)
            oldPost.set('image', req.body.image)

            const savedPost = await oldPost.save()

            res.json(savedPost)
        } catch (err) {
            console.error(err)
            res.status(500).json({msg: "internal server error"})
        }
    })

route.post('/posts/like/:id', async (req, res) => {
    const schema = joi.object({
        id: joi.number().min(1).required(),
    })
    const {error} = schema.validate({
        id: req.params.id,
    })
    if (error)
        return res.status(400).json({msg: error.message})
    try {
        const oldPost = await Post.findOne({
            where: {
                id: req.params.id,
            }
        })
        if (oldPost === null)
            return res.status(404).json({msg: "post not found"})

        const [like, created] = await Like.findOrCreate({
            where: {
                postID: oldPost.get('id'),
                userID: req.usr.username,
            }
        })
        if (!created)
            return res.status(409).json({msg: "already liked"})

        oldPost.set('likeCount', await Like.count({where: {postID: oldPost.get('id')}}))
        const savedPost = await oldPost.save()
        res.json(savedPost)
    } catch (err) {
        console.error(err)
        res.status(500).json({msg: "internal server error"})
    }
})

route.post('/posts/unlike/:id', async (req, res) => {
    const schema = joi.object({
        id: joi.number().min(1).required(),
    })
    const {error} = schema.validate({
        id: req.params.id,
    })
    if (error)
        return res.status(400).json({msg: error.message})
    try {
        const oldPost = await Post.findOne({
            where: {
                id: req.params.id,
            }
        })
        if (oldPost === null)
            return res.status(404).json({msg: "post not found"})

        const removed = await Like.destroy({
            where: {
                postID: oldPost.get('id'),
                userID: req.usr.username,
            }
        })
        if (removed === 0)
            return res.status(409).json({msg: "not liked yet"})

        oldPost.set('likeCount', await Like.count({where: {postID: oldPost.get('id')}}))
        const savedPost = await oldPost.save()
        res.json(savedPost)
    } catch (err) {
        console.error(err)
        res.status(500).json({msg: "internal server error"})
    }
})

route.delete('/posts/:id',
    validateParams(idParam),
    requireOwner(Post),
    destroyEntity)

module.exports = route;