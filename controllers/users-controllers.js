const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');



const getUsers = async (req, res, next) => {

    let users = null;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError('Fetching users failed, please try again later.', 500);
        return next(error);
    }

    res.json({ user: users.map(user => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    };

    const { name, email, password } = req.body;

    let existingUser = null;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Signing up failed, please try again later.', 500);
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError('User exists already, please login instead.', 422)
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        image: 'data:image/jpeg;base64,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',
        password,
        places: []
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError('Signing up failed, please try again.', 500);

        return next(error);
    };

    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {

    const { email, password } = req.body;

    let existingUser = null;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Logging in failed, please try again later.', 500);
        return next(error);
    }

    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError('Invalid credentials, could not log you in.', 401);
        return next(error);
    }

    res.json({
        message: 'Logged in!',
        user: existingUser.toObject({ getters: true })
    });
};


module.exports = {
    getUsers,
    signup,
    login
};