import axios from 'axios'
import { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import ReactLoading from 'react-loading'
import TableFooter from './Table/TableFooter'
import useTable from './Table/useTable'
import { AuthContext } from '../context/authContext'

export default function Table({ name, rowsPerPage, reportCategory, sortByTool, reportSortType, reportSortBy, footerButton, footerButtonText, footerButtonLink }) {

    const [data, setData] = useState([])
    const [locations, setLocations] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const { slice, range } = useTable(data, page, rowsPerPage);
    const { token } = useContext(AuthContext)

    const [tools, setTools] = useState([])
    const [users, setUsers] = useState([])
    const [reportTools, setReportTools] = useState(false)
    const [deleteResponse, setDeleteResponse] = useState([])
    let tempData
    let tempLocations

    useEffect(() => {
        if (!reportCategory) {
            reportCategory = "general"
        }

        if (name === "report") {
            if (reportCategory === "tools") {
                setReportTools(true)
            }
            getReportTable()
        } else if (name === "bookings") {
            getBookingsTable()
        } else {
            getTable()
        }

    }, []);


    const getTable = () => {
        setLoading(true)
        axios.get(`https://wms-api-ps1s.onrender.com/api/${name}`, { token })
            .then((response) => {
                tempData = response.data
                axios.get(`https://wms-api-ps1s.onrender.com/api/locations`, { token })
                    .then((response) => {
                        tempLocations = response.data
                        setData(tempData)
                        setLocations(tempLocations)
                        setLoading(false)
                    })
                    .catch(error => console.error("Error: " + error))

            })
            .catch(error => console.error("Error: " + error))
    }

    useEffect(() => {
        if (name === "report") {
            getReportTable()
        }
    }, [reportSortType, reportSortBy, reportCategory, sortByTool])

    useEffect(() => {
        if (name != "report" && name != "bookings") {
            getTable()
        }

        if (name === "bookings") {
            getBookingsTable()
        }
    }, [name])


    // ? Functions for the report table
    const getReportTable = () => {
        axios.post(`https://wms-api-ps1s.onrender.com/api/report/all`, { category: reportCategory, sortType: reportSortType, sortBy: reportSortBy })
            .then((response) => {
                setData(response.data)
                getToolsAndUsers()
            })
            .catch(error => console.error("Error: " + error))
    }

    // ? Functions for the bookings table
    const getBookingsTable = () => {
        setLoading(true)
        axios.get(`https://wms-api-ps1s.onrender.com/api/bookings`, { token })
            .then((response) => {
                setData(response.data)
                getToolsAndUsers()
            })
            .catch(error => console.error("Error: " + error))
    }

    // ? Get all tool & user info for the reports
    const getToolsAndUsers = () => {
        axios.get(`https://wms-api-ps1s.onrender.com/api/tools`, { token })
            .then((response) => {
                tempData = response.data
                axios.get(`https://wms-api-ps1s.onrender.com/api/users`, { token })
                    .then((response) => {
                        setTools(tempData)
                        setUsers(response.data)
                        setLoading(false)
                    })
                    .catch(error => console.error("Error: " + error))

            })
            .catch(error => console.error("Error: " + error))
    }

    // ? Delete report route
    const deleteReport = (id) => {
        if (!confirm('Are you sure you want to delete this report?')) return
        setLoading(true)
        axios.delete(`https://wms-api-ps1s.onrender.com/api/report/${id}`)
            .then((response) => {
                setDeleteResponse(response)
                    .catch(error => console.error("Error: " + error))
            })
    }

    // ? Delete booking route
    const deleteBooking = (id) => {
        if (!confirm('Are you sure you want to delete this booking?')) return
        setLoading(true)
        axios.delete(`https://wms-api-ps1s.onrender.com/api/bookings/${id}`)
            .then((response) => {
                setDeleteResponse(response)
                    .catch(error => console.error("Error: " + error))
            })
    }

    useEffect(() => {
        if (deleteResponse < 1) return
        alert("Report successfully deleted."),
            setLoading(false)
        getReportTable()


    }, [deleteResponse]);

    const returnRole = (role) => {
        if (role === 1) {
            return "Admin"
        } else {
            return "Maker"
        }
    }

    const returnFullName = (id) => {
        for (let i = 0; i < users.length; i++) {
            if (id === users[i].id) {
                return users[i].first_name + " " + users[i].last_name
            }
        }
    }

    const returnToolName = (id) => {
        for (let i = 0; i < tools.length; i++) {
            if (id === tools[i].id) {
                return tools[i].name
            }
        }
    }

    const returnReadableDate = (date) => {
        let nudate = new Date(date)
        return nudate.toLocaleDateString("no") + " (" + nudate.toLocaleTimeString("no") + ")"
    }


    const items = []
    const headers = []


    // Check if location_id matches, if so add the location as a name to the data array
    if (name != "report") {
        for (let i = 0; i < data.length; i++) {
            for (let z = 0; z < locations.length; z++) {
                if (data[i].location_id === locations[z].location_id) {
                    data[i].location = locations[z].location
                }
            }
        }
    }


    // Headers

    if (name === "report") {
        // Custom manual headers for report table
        headers.push(<th scope="col" key="Image" className="px-6 py-3 ">Image provided</th>)
        headers.push(<th scope="col" key="Sent by" className="px-6 py-3 ">Sent by</th>)
        { reportTools ? headers.push(<th scope="col" key="Tool" className="px-6 py-3 ">Tool</th>) : null }
        headers.push(<th scope="col" key="Title" className="px-6 py-3 ">Subject</th>)
        headers.push(<th scope="col" key="Description" className="px-6 py-3 ">Message</th>)
        headers.push(<th scope="col" key="Urgent" className="px-6 py-3 ">Urgent?</th>)
        headers.push(<th scope="col" key="Date" className="px-6 py-3 ">Report Sent At</th>)
    } else if (name === "bookings") {
        headers.push(<th scope="col" key="Name" className="px-6 py-3 ">Name</th>)
        headers.push(<th scope="col" key="Tool" className="px-6 py-3 ">Tool</th>)
        headers.push(<th scope="col" key="Start Time" className="px-6 py-3 ">Start Time</th>)
        headers.push(<th scope="col" key="End Time" className="px-6 py-3 ">End Time</th>)
        headers.push(<th scope="col" key="Date" className="px-6 py-3 ">Date</th>)
    } else {
        if (Array.isArray(data) && data.length > 0) {
            data.map((item, key) => {
                if (key === 0) {
                    for (const key in item) {
                        if (key === "id" || key === "imageurl" || key === 'visible' || key === 'course_id_string' || key === 'location_id' || key === 'bookable' || key === 'course_id' || key === 'password') continue
                        let nukey = key.replace("_", " ")
                        headers.push(<th scope="col" key={nukey} className="px-6 py-3 ">{nukey}</th>)
                    }
                }
            })
        }
    }

    if (Array.isArray(slice)) {
        slice.map((item, index) => {
            switch (name) {
                case "tools":
                    items.push(
                        <tr className="bg-white border-b hover:bg-ghost-white  ">
                            <td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap  ">
                                {item.name}
                            </td>

                            <td className="px-6 py-4">
                                {item.description}
                            </td>

                            <td className="px-6 py-4">
                                {item.broken ? "Yes" : ""}
                            </td>

                            <td className="px-6 py-4">
                                {item.dangerous ? <><img className='inline' src='/icons/alert-triangle.svg' />Yes</> : ''}
                            </td>

                            <td className="px-6 py-4">
                                {item.location ? item.location : "N/A"}
                            </td>

                            <td className="px-6 py-4">
                                <Link className="font-medium text-plum transition ease-in-out hover:delay-50 duration-500 hover:underline hover:text-eerie-black underline-offset-4" to={"/tools/" + item.id}>Book</Link>
                            </td>
                        </tr>
                    )
                    break

                case "users":
                    items.push(
                        <tr className="bg-white border-b hover:bg-ghost-white  ">
                            <td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap  ">
                                {item.first_name}
                            </td>

                            <td className="px-6 py-4">
                                {item.last_name}
                            </td>

                            <td className="px-6 py-4">
                                {item.email}
                            </td>

                            <td className="px-6 py-4">
                                {returnRole(item.role)}
                            </td>

                            <td className="px-6 py-4">
                                <Link className="font-medium text-plum transition ease-in-out hover:delay-50 duration-500 hover:underline hover:text-eerie-black underline-offset-4" to={"/admin/user/" + item.id}>Edit</Link>
                            </td>
                        </tr>
                    )
                    break

                case "report":
                    if (!reportTools || sortByTool == 0 || item.tool_id == sortByTool) {
                        items.push(
                            <tr className="bg-white border-b hover:bg-ghost-white  ">

                                <td className="px-6 py-4">
                                    {item.imageurl ? <img className="max-w-sm max-h-sm" src={item.imageurl} alt={"Image of " + item.toolname} /> : "None"}
                                </td>

                                <td className="px-6 py-4">
                                    {returnFullName(item.user_id)}
                                </td>

                                {
                                    reportTools ?
                                        <td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap  ">
                                            {returnToolName(item.tool_id)}
                                        </td>
                                        :
                                        null
                                }

                                <td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap  ">
                                    {item.title}
                                </td>

                                <td className="px-6 py-4">
                                    {item.description}
                                </td>

                                <td className="px-6 py-4">
                                    {item.important ? "Yes" : ""}
                                </td>

                                <td className="px-6 py-4">
                                    {returnReadableDate(item.created_at)}
                                </td>

                                <td className="px-6 py-4">
                                    <div className="cursor-pointer font-medium text-plum transition ease-in-out hover:delay-50 duration-500 hover:underline hover:text-eerie-black underline-offset-4" onClick={() => { deleteReport(item.report_id) }}>Delete</div>
                                </td>
                            </tr>
                        )
                    }

                    break

                case "bookings":
                    items.push(
                        <tr className="bg-white border-b hover:bg-ghost-white  ">
                            <td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap  ">
                                {returnFullName(item.user_id)}
                            </td>

                            <td className="px-6 py-4">
                                {returnToolName(item.tool_id)}
                            </td>

                            <td className="px-6 py-4">
                                {item.booking_start}
                            </td>

                            <td className="px-6 py-4">
                                {item.booking_end}
                            </td>

                            <td className="px-6 py-4">
                                {item.booking_date}
                            </td>

                            <td className="px-6 py-4">
                                <div className="cursor-pointer font-medium text-plum transition ease-in-out hover:delay-50 duration-500 hover:underline hover:text-eerie-black underline-offset-4" onClick={() => { deleteBooking(item.booking_id) }}>Delete</div>
                            </td>
                        </tr>
                    )
                    break
            }
        })
    }



    headers.push(<th key="Action" scope="col" className="px-6 py-3">Action</th>)

    if (!page || page < 1) {
        setPage(1)
    } else {
        //console.log(page)
    }



    return (
        <div className="overflow-x-auto max-w-full mx-auto my-5 shadow-md sm:rounded-lg md:w-5/6">
            {loading ?
                <div className="flex flex-col align-middle justify-center items-center">
                    <ReactLoading type="spin" color="#9C528B" />
                </div>
                :
                <div>
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-white uppercase bg-plum ">
                            <tr>
                                {headers}
                            </tr>
                        </thead>
                        <tbody className='[&>*:nth-child(even)]:bg-purple-50'>
                            {items}
                        </tbody>

                    </table>
                    <TableFooter range={range} slice={slice} setPage={setPage} button={footerButton} buttonLink={footerButtonLink} buttonText={footerButtonText} />

                </div>
            }

        </div>
    )
}


// * Pagination part of table

/* 
<nav className="flex items-center justify-between pt-4" aria-label="Table navigation">
                <span className="text-sm font-normal text-gray-500 ">Showing <span className="font-semibold text-gray-900 ">1-10</span> of <span className="font-semibold text-gray-900 ">1000</span></span>
                <ul className="inline-flex items-center -space-x-px">
                    <li>
                        <a href="#" className="block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 ">
                            <span className="sr-only">Previous</span>
                            <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                        </a>
                    </li>
                    <li>
                        <a href="#" aria-current="page" className="z-10 px-3 py-2 leading-tight text-plum border border-purple-300 bg-purple-50 hover:bg-purple-100 hover:text-plum ">1</a>
                    </li>
                    <li>
                        <a href="#" className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-ghost-white hover:text-gray-700 ">2</a>
                    </li>
                    <li>
                        <a href="#" className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-ghost-white hover:text-gray-700 ">3</a>
                    </li>
                    <li>
                        <a href="#" className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-ghost-white hover:text-gray-700 ">...</a>
                    </li>
                    <li>
                        <a href="#" className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-ghost-white hover:text-gray-700 ">100</a>
                    </li>
                    <li>
                        <a href="#" className="block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-ghost-white hover:text-gray-700 ">
                            <span className="sr-only">Next</span>
                            <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                        </a>
                    </li>
                </ul>
            </nav> */
