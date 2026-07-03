import express from 'express'
import { getUsers, getUser, updateUser, deleteUser } from '../controllers/userController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const userRouter = express()

// Middleware for checking if user is logged in, and is admin
//userRouter.use(authMiddleware)

userRouter.route('/')
    .get(getUsers)

userRouter.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser)

export { userRouter }