import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const authRouter = express()

authRouter.post('/register', registerUser)

authRouter.post('/login', loginUser)

export { authRouter }