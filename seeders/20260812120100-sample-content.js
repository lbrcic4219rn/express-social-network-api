'use strict';
const bcrypt = require('bcrypt');

const PASSWORD = 'password123';
const USERS = ['alice', 'bob'];
const TAGS = ['travel', 'food', 'code'];

const POSTS = [
    {id: 1, userID: 'alice', data: 'Sunset over the old bridge.', image: 'https://picsum.photos/id/1015/600/400', tags: ['travel']},
    {id: 2, userID: 'alice', data: 'Best carbonara I have made so far.', image: 'https://picsum.photos/id/292/600/400', tags: ['food']},
    {id: 3, userID: 'bob', data: 'Finally got the migrations green.', image: 'https://picsum.photos/id/180/600/400', tags: ['code', 'travel']},
];

const LIKES = [
    {postID: 1, userID: 'bob'},
    {postID: 2, userID: 'bob'},
    {postID: 3, userID: 'alice'},
];

module.exports = {
    up: async (queryInterface) => {
        const alreadySeeded = await queryInterface.rawSelect('Posts', {where: {id: POSTS[0].id}}, ['id']);
        if (alreadySeeded) {
            console.log('Sample content is already present, skipping.');
            return;
        }

        const now = new Date();
        const hash = bcrypt.hashSync(PASSWORD, 10);
        const stamps = {createdAt: now, updatedAt: now};

        await queryInterface.bulkInsert('Users', USERS.map(username => ({
            username,
            password: hash,
            admin: false,
            bio: `Just ${username}, posting things.`,
            profilePicture: `https://i.pravatar.cc/150?u=${username}`,
            ...stamps,
        })));

        await queryInterface.bulkInsert('Tags', TAGS.map(tagName => ({tagName, ...stamps})));

        await queryInterface.bulkInsert('Posts', POSTS.map(post => ({
            id: post.id,
            userID: post.userID,
            data: post.data,
            image: post.image,
            likeCount: LIKES.filter(like => like.postID === post.id).length,
            ...stamps,
        })));

        await queryInterface.bulkInsert('Post_Tags', POSTS.flatMap(post =>
            post.tags.map(tagName => ({postID: post.id, tagName, ...stamps}))
        ));

        await queryInterface.bulkInsert('Likes', LIKES.map(like => ({...like, ...stamps})));

        await queryInterface.bulkInsert('Comments', [
            {userID: 'bob', postID: 1, data: 'That light is unreal.', ...stamps},
            {userID: 'bob', postID: 2, data: 'Recipe please!', ...stamps},
            {userID: 'alice', postID: 3, data: 'Congratulations, that took a while.', ...stamps},
        ]);

        await queryInterface.bulkInsert('Stories', [
            {userID: 'alice', data: 'https://picsum.photos/id/1025/400/700', ...stamps},
            {userID: 'bob', data: 'https://picsum.photos/id/1062/400/700', ...stamps},
        ]);

        console.log(`Seeded ${USERS.length} users with the password "${PASSWORD}".`);
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('Likes', {userID: USERS});
        await queryInterface.bulkDelete('Comments', {userID: USERS});
        await queryInterface.bulkDelete('Stories', {userID: USERS});
        await queryInterface.bulkDelete('Post_Tags', {postID: POSTS.map(p => p.id)});
        await queryInterface.bulkDelete('Posts', {id: POSTS.map(p => p.id)});
        await queryInterface.bulkDelete('Tags', {tagName: TAGS});
        await queryInterface.bulkDelete('Users', {username: USERS});
    }
};
