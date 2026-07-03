import React, { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import Cookie from 'universal-cookie'
import DangerWarning from './Errors/DangerWarning.jsx'
import { AuthContext } from '../context/authContext.jsx'

export default function LoginForm() {
    const [login, setLogin] = useState(true)
    const { token, setToken } = useContext(AuthContext)

    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const onSubmit = async (userData) => {
        setLogin(true)

        try {
            const response = await axios.post('https://wms-api-ps1s.onrender.com/api/login', {
                email: userData.email,
                password: userData.password
            })

            const responseToken = response.data.token.split(' ')[1]

            setToken(responseToken)

            window.alert('You have successfully been logged in!')

            navigate('/userpage')
        } catch (error) {
            setLogin(false)


            if (error.response) {
                const { status, data } = error.response;
                if (status === 400 && data && data.err) {
                    setError("email", { type: "manual", message: data.err });
                } else if (status === 401) {
                    setError("email", { type: "manual", message: "Invalid email or password" });
                }
            }

            console.error(error);
        }
    }

    return (

        <form
            onSubmit={handleSubmit(onSubmit)}
            className="top-1 h-200 flex flex-col justify-center items-center space-y-10"
        >
            <h2 className="text-2xl font-bold text-eerie-black md:text-4xl ">User Login</h2>
            <div className="mb-6 w-7/12 md:w-4/12 ">
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-eerie-black ">Your email</label>
                <input
                    type="email"
                    id="email"
                    className="bg-white border border-gray-300 text-eerie-black text-sm rounded-lg focus:ring-robin-egg-blue focus:border-robin-egg-blue block w-full  p-2.5 "
                    placeholder="name@stud.ntnu.no"
                    {...register("email", { required: true })} />

            </div>
            {errors.email && <span className="m-3 bg-red-100 p-2 rounded-xl border-red-300 border-2" role="alert">Email is missing</span>}
            <div className="mb-6 w-7/12 md:w-4/12">
                <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-eerie-black ">
                    Your password
                </label>
                <input
                    type="password"
                    id="password"
                    className="bg-white border border-gray-300 text-eerie-black text-sm rounded-lg focus:ring-robin-egg-blue focus:border-robin-egg-blue block w-full p-2.5 "
                    {...register("password", { required: true })} />
            </div>
            {errors.password && <span className="m-3 bg-red-100 p-2 rounded-xl border-red-300 border-2" role="alert">Password is missing</span>}

            {!login ? <DangerWarning text="Wrong username or password" /> : ''}
            <div className="flex items-start mb-6">
                <div className="flex items-center h-5">
                    <input id="remember" type="checkbox" value="" className="w-4 h-4 border border-gray-300 rounded bg-white focus:ring-3 focus:robin-egg-blue" />
                </div>
                <label htmlFor="remember" className="ml-2 text-sm font-medium text-gray-900 ">Remember me</label>
            </div>
            <p className="">Need help?  <Link to="/contact" className="transition ease-in-out hover:transition-delay-50 duration-300 hover:text-plum underline underline-offset-8">Contact us</Link></p>
            <input
                className="w-40 group shadow-lg h-14  px-5 m-2 rounded-full transition-colors duration-300 ease-in-out text-xl text-white bg-plum hover:delay-50  hover:bg-ghost-white hover:border hover:border-plum  hover:text-plum hover:cursor-pointer  focus:outline-none font-medium text-s md:text-2xl w-50 md:w-60 text-center mr-2 mb-2 disabled:bg-slate-400"
                type="submit"
                value="Login" />
        </form>
    )
}