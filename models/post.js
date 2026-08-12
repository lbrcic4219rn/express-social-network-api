'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Post extends Model {
        static associate({Comment, User, Post_Tag, Like}) {
            this.hasMany(Comment, {
                foreignKey: "postID",
                onDelete: 'cascade',
                hooks: true,
            })
            this.hasMany(Post_Tag, {
                foreignKey: "postID",
                onDelete: 'cascade',
                hooks: true,
            })
            this.hasMany(Like, {
                foreignKey: "postID",
                onDelete: 'cascade',
                hooks: true,
            })
            this.belongsTo(User, {
                foreignKey: "userID"
            })
        }
    }

    Post.init({
        data: DataTypes.STRING,
        likeCount: DataTypes.INTEGER,
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: 'Post',
    });
    return Post;
};