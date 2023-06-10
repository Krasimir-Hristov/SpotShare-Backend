const express = require("express");
const { check } = require('express-validator');

const placesControllers = require('../controllers/places-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require("../middleware/check-auth");

const router = express.Router();


router.get('/:placeId', placesControllers.getPlaceById);

router.get('/user/:userId', placesControllers.getPlacesByUserId);

router.use(checkAuth);

router.post(
    '/',
    fileUpload.single('image'),
    [
        check('title')
            .trim()
            .notEmpty(),
        check('description')
            .trim()
            .isLength({ min: 5 }),
        check('address')
            .trim()
            .notEmpty()
    ],
    placesControllers.createPlace);

router.patch('/:placeId', [
    check('title')
        .trim()
        .notEmpty(),
    check('description')
        .trim()
        .isLength({ min: 5 }),
], placesControllers.updatePlace);

router.delete('/:placeId', placesControllers.deletePlace);

module.exports = router;