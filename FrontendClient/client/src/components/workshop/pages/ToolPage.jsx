import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import DangerWarning from '../components/Errors/DangerWarning.jsx'
import { useForm, useWatch } from 'react-hook-form'
import { AuthContext } from '../context/authContext.jsx'
import jwt_decode from 'jwt-decode'
import Button from '../components/Button.jsx'
import FrequencyChart from "../components/FrequencyChart.jsx";

const defaultTool = {
    id: "loading",
    name: "name",
    imageurl: "imageurl",
    description: "description",
    broken: false,
    dangerous: false,
};

export default function ToolPage() {
    const [tool, setTool] = useState(defaultTool);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(0)
    const [timeSpanError, setTimeSpanError] = useState(false)
    const [overlapError, setOverlapError] = useState(false)
    const [existingBookings, setExistingBookings] = useState(false)
    let { id } = useParams();
    const { token } = useContext(AuthContext)
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm();



    useEffect(() => {

        // Getting the tool id from params
        getTool(id);

    }, []);

    useEffect(() => {
        if (!token)
            return

        setUserId(jwt_decode(token).sub)
    }, [token])

    const getTool = async (id) => {
        await axios
            .get(`https://wms-api-ps1s.onrender.com/api/tools/${id}`)
            .then((response) => {
                setLoading(false)
                setTool(response.data[0])
            })
            .catch((error) => console.error("Error: " + error))
    }

    const getTimeSpanInHours = (starttime, endtime) => {

        const start = new Date(`1970-01-01T${starttime}`);
        const end = new Date(`1970-01-01T${endtime}`);
        const diffInMs = end - start;
        const diffInHours = diffInMs / (1000 * 60 * 60);

        if (diffInHours > 12)
            return false

        return true
    }

    const getCurrentTime = (type) => {


        const now = new Date();

        // If the argument being passed is 'end' extend the hours by 1
        let hours = String(now.getHours()).padStart(2, '0');
        if (type === 'end')
            hours++

        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;


        return currentTime
    }

    const onSubmit = formData => {

        if (!getTimeSpanInHours(formData.booking_start, formData.booking_end)) {
            return setTimeSpanError(true)
        }

        if (!window.confirm(`You are about to book ${tool.name} on the ${formData.booking_date}. Please check over you data: start-time: ${formData.booking_start}, end-time: ${formData.booking_end}`))
            return

        if(!window.confirm(`Remember you need the appropriate HMS course to book this tool. If you book this tool without the course, it can lead to suspension, or a ban for the workshop. This tool requires the course: ${tool.course_id_string}. By continuing you confirm you have taken this course`))
            return


        const bookingData = {
            ...formData,
            user_id: userId,
            tool_id: tool.id
        }

        axios.post(`http://localhost:9003/api/bookings`, bookingData)
            .then(res => {
                window.alert('Booking completed, navigating you to the user page')
                navigate('/userpage')
            }).catch(err => {
                setOverlapError(err.response.data.error)
                setExistingBookings(err.response.data.overlappingBookings)
            })

    }

    return (
        <div>
            {loading ? (
                <h1>Loading...</h1>
            ) : (
                <div className="flex justify-center flex-col items-center">
                    <img className="w-64 h-48 p-2 rounded-2xl" src={tool.imageurl} />
                    <h1 className="text-3xl font-bold ">{tool.name}</h1>
                    <p>{tool.description}</p>

                    {tool.course_id && <h3 className="m-2 font-bold">Required HMS Course(s): {tool.course_id_string}</h3>}


                    {tool.dangerous ? <DangerWarning text="Potentially dangerous tool, use caution" /> : ''}

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col justify-center items-center [&>*]:m-3">

                        <div className="flex gap-2 items-center">
                            <label
                                htmlFor="booking_date">Date:</label>
                            <input
                                {...register('booking_date',
                                    {
                                        required: true,
                                        /* Setting the minimum date to the current date */
                                        min: new Date().toISOString().split('T')[0],

                                        // Ensuring a user can not book tools more than two weeks in the future
                                        max: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
                                    })}
                                defaultValue={new Date().toISOString().split('T')[0]}
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                className="bg-white border border-gray-300 text-eerie-black text-sm rounded-lg focus:ring-robin-egg-blue focus:border-robin-egg-blue block w-full p-2.5 "
                                name="booking_date" />

                        </div>
                        {errors.booking_date?.type === 'required' && <span className="bg-red-100 p-2 rounded-xl border-red-300 border-2" role="alert">Date is required</span>}

                        {/* Error handlig if the user removed the min requirement from the html */}
                        {errors.booking_date?.type === 'min' && <span className="bg-red-100 p-2 rounded-xl border-red-300 border-2" role="alert">Cannot book tools in the past</span>}
                        {errors.booking_date?.type === 'max' && <span className="bg-red-100 p-2 rounded-xl border-red-300 border-2" role="alert">Cannot book tools more than two weeks into the future</span>}

                        <div className="flex gap-2 items-center">
                            <label
                                className="min-w-[8ch]"
                                htmlFor="booking_start">Start time:</label>
                            <input
                                {...register('booking_start', { required: true })}
                                defaultValue={getCurrentTime()}
                                type="time"
                                className="bg-white border border-gray-300 text-eerie-black text-sm rounded-lg focus:ring-robin-egg-blue focus:border-robin-egg-blue block w-full p-2.5 "
                                name="booking_start" />
                        </div>
                        {errors.booking_start && <span className="bg-red-100 p-2 rounded-xl border-red-300 border-2" role="alert">Start time is required</span>}

                        <div className="flex gap-2 items-center">
                            <label
                                className="min-w-[8ch]"
                                htmlFor="booking_end">End time:</label>
                            <input
                                {...register('booking_end', { required: true, min: watch('booking_start') })}
                                type="time"
                                defaultValue={getCurrentTime('end')}
                                className="bg-white border border-gray-300 text-eerie-black text-sm rounded-lg focus:ring-robin-egg-blue focus:border-robin-egg-blue block w-full p-2.5 "
                                name="booking_end" />
                        </div>
                        {errors.booking_end?.type === 'required' && <span className="bg-red-100 p-2 rounded-xl border-red-300 border-2" role="alert">End time is required</span>}
                        {errors.booking_end?.type === 'min' && <span className="bg-red-100 p-2 rounded-xl border-red-300 border-2" role="alert">End time must be later than start time. Please choose a valid end time.</span>}

                        {timeSpanError && <span className="bg-red-100 p-2 rounded-xl border-red-300 border-2" role="alert">Timespan cannot exceed 12 hours</span>}
                        {overlapError && <span className="bg-red-100 p-2 rounded-xl border-red-300 border-2" role="alert">{overlapError}</span>}

                        {existingBookings && <ShowExistingBookings existingBookings={existingBookings} />}

                        {token ? (
                            <input
                                className="w-40 group shadow-lg h-14  px-5 m-2 rounded-full transition-colors duration-300 ease-in-out  text-white bg-plum hover:delay-50  hover:bg-ghost-white hover:border hover:border-plum  hover:text-plum  focus:outline-none font-medium text-s md:text-2xl w-50 md:w-60 text-center mr-2 mb-2 disabled:bg-slate-400"
                                type="submit"
                                value="Book!" />)
                            : (<>
                                <p className="font-bold underline underline-offset-2">You must login to start booking tools</p>

                                <Button text="Login here" link="/login" />
                            </>)}
                    </form>
                    {token ? <Link className="transition ease-in-out hover:transition-delay-50 duration-300 hover:text-plum hover:underline underline-offset-8" to={`/tools/report/${tool.id}`}>Report this tool</Link> : null}
                </div>
            )}

            <FrequencyChart toolId={id} />
        </div>
    )
}


// Helper function for rendering out the unavailable times for tools
function ShowExistingBookings({ existingBookings }) {
    return (
        <>
            <h2>The tool is unavailable at these timeslots: </h2>
            <ul>
                {existingBookings.map((booking) => {

                    const startTime = booking.booking_start.split(":").slice(0, 2).join(":");
                    const endTime = booking.booking_end.split(":").slice(0, 2).join(":");

                    return (
                        <li key={booking.booking_id}>
                            {startTime} - {endTime}
                        </li>
                    );
                })}
            </ul>
        </>
    );
}