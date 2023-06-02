const { v4: uuidv4, v4 } = require('uuid');
const { validationResult } = require('express-validator');


const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');

let DUMMY_PLACES = [

    {
        id: 'p1',
        title: 'Empire State Building',
        description: 'One of the most famous sky scrapers in the word!',
        location: {
            lat: 40.7484474,
            lng: -73.9871516
        },
        address: '20 W 34th St, New York, NY 10001',
        creator: 'u1'
    }
];

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
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
        creator
    });

    try {
        await createdPlace.save();
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again.', 500);

        return next(error);
    };

    res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        throw new HttpError('Invalid inputs passed, please check your data.', 422);
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

const deletePlace = (req, res, next) => {

    const placeId = req.params.placeId;

    if (!DUMMY_PLACES.find(place => place.id === placeId)) {
        throw new HttpError('Could not find a place for that id.', 404);
    };

    DUMMY_PLACES = DUMMY_PLACES.filter(place => place.id !== placeId);

    res.status(200).json({ message: 'Your place was deleted!' });
};



module.exports = {
    getPlaceById,
    getPlacesByUserId,
    createPlace,
    updatePlace,
    deletePlace
};
