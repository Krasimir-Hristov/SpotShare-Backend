const fs = require('fs');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');


const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');


const getPlaceById = async (req, res, next) => {

    const placeId = req.params.placeId;

    let place = null;
    try {

        place = await Place.findById(placeId);
    } catch (err) {

        const error = new HttpError('Something went wrong, could not find a place.', 500);

        return next(error);
    }

    if (!place) {

        const error = new HttpError('Could not find a place for the provided id.', 404);

        return next(error);
    }

    res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {

    const userId = req.params.userId;


    let places = null;
    try {

        places = await Place.find({ creator: userId });
    } catch (err) {

        const error = new HttpError('Fetching places failed, please try again later', 500);

        return next(error);
    }

    if (!places || places.length === 0) {

        return next(new HttpError('Could not find a places for the provided user id.', 404));
    }

    res.json({ places: places.map(place => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    };

    const { title, description, address, creator } = req.body;

    let coordinates = null;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }

    const createdPlace = new Place({

        title,
        description,
        address,
        location: coordinates,
        image: req.file.path,
        creator
    });

    let user = null;

    try {
        user = await User.findById(creator);

    } catch (err) {
        const error = new HttpError('Creating place failed, please try again.', 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided id', 404);
        return next(error);
    }


    try {
        const currentSession = await mongoose.startSession();
        currentSession.startTransaction();

        await createdPlace.save({ session: currentSession }); // Правилно: използвай 'createdPlace', не 'createPlace'
        user.places.push(createdPlace);

        await user.save({ session: currentSession });

        await currentSession.commitTransaction();
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again.', 500);

        return next(error);
    };


    res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    };

    const { title, description } = req.body;
    const placeId = req.params.placeId;

    let place = null;
    try {

        place = await Place.findById(placeId);
    } catch (err) {

        const error = new HttpError('Something wnt wrong, could not update place.', 500);
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {

        await place.save();
    } catch (err) {

        const error = new HttpError('Something wnt wrong, could not update place.', 500);
        return next(error);
    }

    res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {

    const placeId = req.params.placeId;

    let place = null;

    try {

        place = await Place.findById(placeId).populate('creator');
    } catch (err) {

        const error = new HttpError('Something went wrong, could not delete place', 500);
        return next(error);
    }

    if (!place) {

        const error = new HttpError('Could not find place for this id.', 404);
        return next(error);
    }

    const imagePath = place.image;

    try {

        const currentSession = await mongoose.startSession();
        currentSession.startTransaction();
        await place.deleteOne({ session: currentSession });

        place.creator.places.pull(place);
        await place.creator.save({ session: currentSession });
        await currentSession.commitTransaction();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete place', 500);
        return next(error);
    }

    fs.unlink(imagePath, err => {
        
        console.log(err);
    });
    
    res.status(200).json({ message: 'Your place was deleted!' });
};




module.exports = {
    getPlaceById,
    getPlacesByUserId,
    createPlace,
    updatePlace,
    deletePlace
};
