const { v4: uuidv4, v4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');

const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Krasimir Hristov',
        email: 'test@test.com',
        password: 'testers'
    }
];

const getUsers = (req, res, next) => {

    res.json({ users: DUMMY_USERS });
};

const signup = (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError('Invalid inputs passed, please check your data.', 422);
    };
    
    const { name, email, password } = req.body;

    const hasUser = DUMMY_USERS.find(user => user.email === email);
    if (hasUser) {
        throw new HttpError('Could not create user, email already exists.', 422);
    };

    const createdUser = {

        id: v4(),
        name,
        email,
        password
    };

    DUMMY_USERS.push(createdUser);

    res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => {

    const { email, password } = req.body;

    const indentifiedUser = DUMMY_USERS.find(user => user.email === email);

    if (!indentifiedUser || indentifiedUser.password !== password) {
        throw new HttpError('Could not indentify user, creadentials seem to be wrong.', 401);
    };

    res.json({ message: 'Logged in!' });
};


module.exports = {
    getUsers,
    signup,
    login
};