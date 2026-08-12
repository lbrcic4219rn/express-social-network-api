'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate({Comment, Story, Post, Like}) {
            this.hasMany(Comment, {
                foreignKey: "userID",
                onDelete: "cascade",
                hooks: true,
            })
            this.hasMany(Story, {
                foreignKey: "userID",
                onDelete: "cascade",
                hooks: true,
            })
            this.hasMany(Post, {
                foreignKey: "userID",
                onDelete: "cascade",
                hooks: true,
            })
            this.hasMany(Like, {
                foreignKey: "userID",
                onDelete: "cascade",
                hooks: true,
            })
        }
    }

    User.init({
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true,
        },
        bio: {
            type: DataTypes.STRING,
        },
        profilePicture: {
            type: DataTypes.STRING,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    }, {
        sequelize,
        modelName: 'User',
    });
    return User;
};