import express from 'express'
import { getLocations, getLocation } from '../controllers/locationController.js'

const locationRouter = express()

locationRouter.route('/')
    .get(getLocations)

locationRouter.route('/:id')
    .get(getLocation)

export { locationRouter }