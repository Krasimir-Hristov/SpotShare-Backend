const express = require("express");

const router = express.Router();

const DUMMY_PLACES = [

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

router.get('/:placeId', (req, res, next) => {

    const placeId = req.params.placeId;

    const place = DUMMY_PLACES.find(p => {
        return p.id === placeId;
    });

    if (!place) {
        res.status(404).json({message: 'Could not find a place for the provided id.'});
    }

    res.json({ place });
});

router.get('/user/:userId', (req, res, next) => {

    const userId = req.params.userId;

    const place = DUMMY_PLACES.find(u => {
        return u.creator === userId;
    });

    res.json({ place });
});

module.exports = router;