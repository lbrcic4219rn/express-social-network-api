'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Tag extends Model {
        static associate({Post_Tag}) {
            this.hasMany(Post_Tag, {
                foreignKey: 'tagName',
            })
        }
    }

    Tag.init({
        tagName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true,
        }
    }, {
        sequelize,
        modelName: 'Tag',
    });
    return Tag;
};