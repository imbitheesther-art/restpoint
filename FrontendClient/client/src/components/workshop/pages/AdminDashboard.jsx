import Table from "./Table"
import Button from "../components/Button"
import React, { useState } from 'react'
import AdminReports from "./AdminReports"

const RenderDashboard = ({ select }) => {
    switch (select) {
        case "users":
            return (
                <section className="flex justify-center align-middle items-center flex-col m-2">
                    <h1 className=" text-2xl md:text-3xl">Registered users:</h1>
                    <Table name="users" pageRows={15} footerButton={true} footerButtonLink={"/admin/user"} footerButtonText={"Create new user"} />
                </section>
            )

        case "reports":
            return (
                <section className="flex flex-col justify-center text-center align-middle m-2">
                    <h1 className=" text-2xl md:text-3xl">Reports:</h1>
                    <AdminReports />
                </section>
            )

        case "bookings":
            return (
                <section className="flex justify-center align-middle items-center flex-col m-2">
                    <h1 className=" text-2xl md:text-3xl">Current bookings:</h1>
                    <Table name="bookings" pageRows={15} />
                </section>
            )
    }
}

export default function AdminDashboard() {
    const [select, setSelect] = useState("reports")
    const [rows, setRows] = useState(15)



    return (
        <>
            <header className="flex flex-col justify-center align-middle items-center">
                <h1 className="text-3xl font-bold text-eerie-black md:text-4xl ">Admin Dashboard</h1>
            </header>

            <section className="flex justify-center align-middle items-center flex-col md:flex-row m-5">
                <hr class="w-full md:w-96 h-px my-3 bg-gray-300 border-0" />
                <Button size="small" clickFunction={() => { setSelect("reports") }}>Reports</Button>
                <Button size="small" clickFunction={() => { setSelect("users") }}>Users</Button>
                <Button size="small" clickFunction={() => { setSelect("bookings") }}>Bookings</Button>
                <hr class="w-full md:w-96 h-px my-3 bg-gray-300 border-0" />
            </section>

            <RenderDashboard select={select} />®

        </>
    )
}