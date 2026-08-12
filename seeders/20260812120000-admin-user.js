'use strict';
const bcrypt = require('bcrypt');
require('dotenv').config({quiet: true});

const USERNAME = process.env.ADMIN_USERNAME || 'admin';
const PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123';

module.exports = {
    up: async (queryInterface) => {
        if (!process.env.ADMIN_PASSWORD)
            console.warn(`No ADMIN_PASSWORD set, seeding "${USERNAME}" with the default password "${PASSWORD}". Change it before exposing this anywhere.`);

        const existing = await queryInterface.rawSelect('Users', {where: {username: USERNAME}}, ['username']);
        if (existing) {
            console.log(`User "${USERNAME}" already exists, leaving it alone.`);
            return;
        }

        const now = new Date();
        await queryInterface.bulkInsert('Users', [{
            username: USERNAME,
            password: bcrypt.hashSync(PASSWORD, 10),
            admin: true,
            bio: 'Administrator account.',
            profilePicture: null,
            createdAt: now,
            updatedAt: now,
        }]);
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('Users', {username: USERNAME});
    }
};
