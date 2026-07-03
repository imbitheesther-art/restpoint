import express from 'express'
import multer from 'multer'
import { 
    getTools, 
    createTools, 
    getTool, 
    updateTools, 
    deleteTools,
    uploadImage } from '../controllers/toolController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const toolRouter = express()

toolRouter.route('/')
    .get(getTools)
    .post(createTools)

    
const upload = multer()
toolRouter.route('/upload')
    .post(upload.single('file'), uploadImage)

toolRouter.route('/:id')
    .get(getTool)
    .patch(updateTools)
    .delete(deleteTools)

export { toolRouter }