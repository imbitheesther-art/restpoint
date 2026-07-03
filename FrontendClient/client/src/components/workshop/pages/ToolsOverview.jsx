import React, { useContext, useEffect, useState } from 'react'
import Table from './Table'
import Button from '../components/Button'
import ToolCards from './ToolCards'
import CreateToolButton from '../components/CreateToolButton'
import Cookies from 'universal-cookie'
import { AuthContext } from '../context/authContext'

export default function ToolsOverview() {
    const cookie = new Cookies()
    const [toggleView, setToggleView] = useState('gallery')
    const { userRole } = useContext(AuthContext)

    const toggle = () => {
        if (toggleView === 'gallery') {
            setToggleView('table')
            cookie.set('toggleView', 'table')
        }

        if (toggleView === 'table') {
            setToggleView('gallery')
            cookie.set('toggleView', 'gallery')
        }
    }

    useEffect(() => {
        const existingCookie = cookie.get('toggleView')

        if (!existingCookie)
            return

        setToggleView(existingCookie)
    }, [])

    return (

        <div className="flex flex-wrap flex-col justify-center items-center gap-4 min-h-full">
            <Button clickFunction={toggle}>Toggle View</Button>
            {userRole === 1 ? <Button size="small" link="/admin/tool">Create Tool</Button> : null}
            {toggleView === 'table' ? <Table name="tools" pageRows={15} /> : <ToolCards />}
        </div>
    )
}