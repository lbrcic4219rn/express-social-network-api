'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Like extends Model {
        static associate({Post, User}) {
            this.belongsTo(Post, {
                foreignKey: "postID",
            })
            this.belongsTo(User, {
                foreignKey: "userID",
            })
        }
    }

    Like.init({
        postID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        userID: {
            type: DataTypes.STRING,
            primaryKey: true,
        }
    }, {
        sequelize,
        modelName: 'Like',
    });
    return Like;
};
