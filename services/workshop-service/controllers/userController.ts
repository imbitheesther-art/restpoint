import { Request, Response } from "express"
import { supabase } from '../server.js'

/* 
    @route  GET /api/users
    @desc   getting all users
*/
const getUsers = async (req: Request, res: Response) => {
    const { data: data, error } = await supabase.from('users').select('*')

    if (error) {
        res.json(error)
        return
    }

    res.json(data)
}

/* 
    @route  GET /api/tools/:id
    @desc   getting a single tool
*/
const getUser = async (req: Request, res: Response) => {
    const id = req.params.id

    const { data: data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)

    if (error) {
        res.json(error)
        return
    }

    res.json(data)
}


/* 
    @route  PATCH /api/users/:id
    @desc   Updating a user
*/
const updateUser = async (req: Request, res: Response) => {

    const id = req.params.id
    //const field = req.body.field
    //const value = req.body.value
    
    if (!req.body) {
        res.json("Missing input")
        return
    }

    const { data, error } = await supabase
        .from('users')
        .update(req.body)
        .eq('id', id)
        // .match isteden kanskje ?
        //.match({ id: id })

        .select()

    if (error) {
        res.json(error)
        return
    }

    res.json(data)
}

/* 
    @route  /api/tools/:id
    @desc   deleting a tool
*/
const deleteUser = async (req: Request, res: Response) => {
    const id = req.params.id

    const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
        .select()

    if (error) {
        res.json(error)
        return
    }

    res.json(data)
}

export {
    getUsers,
    getUser,
    updateUser,
    deleteUser
}