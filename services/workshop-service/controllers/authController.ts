import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import { pool } from '../database/db'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

/* 
    @route  POST /api/auth/register
    @desc   creating new user
*/
const registerUser = async (req: Request, res: Response) => {
    try {
        const { first_name, last_name, email, password, role } = req.body

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Check if user exists
        const [existing]: any = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        )

        if (existing.length > 0) {
            return res.status(400).json({ error: 'User already registered with that email' })
        }

        const [result]: any = await pool.query(
            `INSERT INTO users (first_name, last_name, email, password, role)
             VALUES (?, ?, ?, ?, ?)`,
            [first_name, last_name, email, hashedPassword, role || 'worker']
        )

        const [newUser]: any = await pool.query(
            'SELECT id, first_name, last_name, email, role, created_at FROM users WHERE id = ?',
            [result.insertId]
        )

        res.status(201).json(newUser[0])
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
}

/*  
    @route  POST /api/auth/login
    @desc   Route for logging in users
*/
const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        const [rows]: any = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        )

        if (!rows.length) {
            return res.status(400).json({ error: 'Username or password incorrect' })
        }

        const user = rows[0]
        const correctPassword = await bcrypt.compare(password, user.password)

        if (!correctPassword) {
            return res.status(400).json({ error: 'Username or password incorrect' })
        }

        const token = 'Bearer ' + jwt.sign(
            { sub: user.id, role: user.role },
            String(process.env.JWT_SECRET),
            { expiresIn: '7d' }
        )

        res.status(200).json({
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
}

export {
    registerUser,
    loginUser
}