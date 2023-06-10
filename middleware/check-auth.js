const HttpError = require("../models/http-error");
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    try {

        const token = req.headers.authorization.split(' ')[1];

        if (!token) {

            throw new Error('Authrntication failed!');
        }

        const decodedToken = jwt.verify(token, 'spotshare_password');
        req.userData = { userId: decodedToken.userId };
        next();
    } catch (err) {

        const error = new HttpError('Authrntication failed!', 401);
        next(error);
    }

};