const express = require('express');

const {createProperty, deleteProperty, updateProperty, getAllProperties, getPropertyDetail} = require('../controllers/property.controller');

const router = express.Router();

router.route('/').get(getAllProperties)
router.route('/:id').get(getPropertyDetail)
router.route('/').post(createProperty)
router.route('/:id').patch(updateProperty)
router.route('/:id').delete(deleteProperty)

module.exports = router;