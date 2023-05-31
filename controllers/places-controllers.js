const { v4: uuidv4, v4 } = require('uuid');



const HttpError = require('../models/http-error');


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

const getPlaceById = (req, res, next) => {

    const placeId = req.params.placeId;

    const place = DUMMY_PLACES.find(p => {
        return p.id === placeId;
    });

    if (!place) {

        throw new HttpError('Could not find a place for the provided id.', 404);

    }

    res.json({ place });
};

const getPlaceByUserId = (req, res, next) => {

    const userId = req.params.userId;

    const place = DUMMY_PLACES.find(u => {
        return u.creator === userId;
    });

    if (!place) {

        return next(new HttpError('Could not find a place for the provided user id.', 404));

    }

    res.json({ place });
};

const createPlace = (req, res, next) => {

    const { title, description, coordinates, address, creator } = req.body;

    const createdPlace = {

        id: v4(),
        title,
        description,
        location: coordinates,
        address,
        creator
    };

    DUMMY_PLACES.push(createdPlace);

    res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {

    const { title, description } = req.body;
    const placeId = req.params.placeId;

    const updatedPlace = { ...DUMMY_PLACES.find(place => place.id === placeId) };
    const placeIndex = DUMMY_PLACES.findIndex(place => place.id === placeId);
    updatedPlace.title = title;
    updatedPlace.description = description;


    DUMMY_PLACES[placeIndex] = updatedPlace;

    res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {

    const placeId = req.params.placeId;
    DUMMY_PLACES = DUMMY_PLACES.filter(place => place.id !== placeId);

    res.status(200).json({ message: 'Your place was deleted!' });
};


exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;