'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Post_Tags', {
            postID: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            tagName: {
                type: Sequelize.STRING,
                allowNull: false,
                primaryKey: true,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Post_Tags');
    }
};