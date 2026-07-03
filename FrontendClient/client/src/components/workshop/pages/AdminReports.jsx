import Table from "./Table"
import Button from "./Button"
import React, { ReactNode, useEffect, useState } from 'react'
import ReactLoading from "react-loading";
import axios from "axios";

export default function AdminReports() {
    const [loading, setLoading] = useState(true);
    const [toolId, setToolId] = useState(0)
    const [sortType, setSortType] = useState("asc")
    const [reportSortBy, setReportSortBy] = useState("created_at")
    const [showTools, setShowTools] = useState(false)
    const [tools, setTools] = useState([])

    useEffect(() => {
        axios
            .get(`https://wms-api-ps1s.onrender.com/api/tools/`)
            .then((response) => {
                setTools(response.data);
                // Setting loading to false when request is read
                setLoading(false);
            })
            .catch((error) => console.error("Error: " + error));
    }, []);

    return (
        <>
            {loading ?
                <div className="flex flex-col align-middle justify-center items-center m-4">
                    <ReactLoading type="spin" color="#9C528B" />
                </div>
                :
                <>

                    <section className="flex justify-center items-center flex-col md:flex-row md:align-center md:text-right md:justify-around">
                        <div className="md:flex md:flex-start flex-col ml-5">
                            <Button size="small" clickFunction={() => { setShowTools(false) }} >General Reports</Button>
                            <Button size="small" clickFunction={() => { setShowTools(true) }} >Tool Reports</Button>
                        </div>

                        <div>
                            <form className="flex flex-row max-w-full md:flex-end md:mr-3 ">
                                <div className="flex flex-col mr-3">
                                    <label className="mb-2" htmlFor="sortType">Sort by:</label>
                                    <select
                                        name="sortBy"
                                        id="sortBy"
                                        className="text-center bg-white border border-gray-300 text-eerie-black text-sm rounded-lg focus:ring-robin-egg-blue focus:border-robin-egg-blue block w-full p-2.5"
                                        onChange={(event) => setReportSortBy(event.target.value)}
                                        value={reportSortBy}
                                    >
                                        <option key="date" value="created_at">Date</option>
                                        <option key="urgent" value="important">Urgent</option>
                                    </select>
                                </div>

                                <div className="flex flex-col  ">
                                    <label className="mb-2" htmlFor="sortType">Sort type:</label>
                                    <select
                                        name="sortType"
                                        id="sortType"
                                        className="text-center bg-white border border-gray-300 text-eerie-black text-sm rounded-lg focus:ring-robin-egg-blue focus:border-robin-egg-blue block w-full p-2.5"
                                        onChange={(event) => setSortType(event.target.value)}
                                        value={sortType}
                                    >
                                        <option key="asc" value="asc">Ascending</option>
                                        <option key="desc" value="desc">Descending</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                    </section>

                    <section className="flex flex-row align-middle justify-center mt-3">
                        <form>
                            {showTools ?
                                <div className="flex flex-col text-center">
                                    <label className="mb-2" htmlFor="tool">Tool:</label>
                                    <select
                                        name="tool"
                                        id="tool"
                                        className="text-center bg-white border border-gray-300 text-eerie-black text-sm rounded-lg focus:ring-robin-egg-blue focus:border-robin-egg-blue block w-full p-2.5"
                                        onChange={(event) => setToolId(event.target.value)}
                                        value={toolId}
                                    >
                                        <option value="0">All</option>
                                        {tools.map((tool) => (
                                            <option value={tool.id}>{tool.name}</option>
                                        ))}
                                    </select></div> : null}
                        </form>
                    </section>


                    <section className="flex justify-center text-center align-middle items-center flex-col">
                        {showTools ?
                            <>
                                <Table name="report" pageRows={8} reportCategory="tools" sortByTool={toolId} reportSortType={sortType} reportSortBy={reportSortBy} />
                            </>

                            :
                            <Table name="report" pageRows={8} reportCategory="general" reportSortType={sortType} reportSortBy={reportSortBy} />


                        }
                    </section>
                </>
            }
        </>
    )
}