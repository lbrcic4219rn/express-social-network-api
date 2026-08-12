'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Story extends Model {
        static associate({User}) {
            this.belongsTo(User, {
                foreignKey: "userID",
            })
        }
    }

    Story.init({
        data: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Story',
    });
    return Story;
};