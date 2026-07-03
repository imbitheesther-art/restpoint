import express from 'express'
import multer from 'multer'
import {
    getReports,
    createReport,
    getReport,
    deleteReport,
    uploadImage
} from '../controllers/reportController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const upload = multer()
const reportRouter = express()

reportRouter.route('/all')
    .post(getReports)

reportRouter.route('/')
    .post(createReport)

reportRouter.route('/upload')
    .post(authMiddleware, upload.single('file'), uploadImage)

reportRouter.route('/:id')
    .get(authMiddleware, getReport)
    .delete(authMiddleware, deleteReport)

export { reportRouter }