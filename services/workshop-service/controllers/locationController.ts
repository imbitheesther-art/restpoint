import { supabase } from '../server.js'
import { Request, Response } from "express"

/* 
    @route  GET /api/tools
    @desc   getting all tools
*/
const getLocations = async (req: Request, res: Response) => {
    const { data: data, error } = await supabase.from('locations').select('*')

    if (error) {
        res.json(error)
        return
    }

    res.json(data)
}

const getLocation = async (req: Request, res: Response) => {
    const id = req.params.id

    const { data: data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('location_id', id)

    if (error) {
        res.json(error)
        return
    }

    res.json(data)
}

export {
    getLocations,
    getLocation
}