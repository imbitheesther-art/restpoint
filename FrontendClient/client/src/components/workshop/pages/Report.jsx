import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import ReactLoading from "react-loading";
import { AuthContext } from "../context/authContext";
import jwt_decode from "jwt-decode";


export default function Report({ isTool, title, placeholder, hasImageUpload }) {
    const [tool, setTool] = useState({});
    const [loading, setLoading] = useState(true);

    const [message, setMessage] = useState("");
    const [subject, setMessageSubject] = useState("");

    const [file, setFile] = useState("");
    const [image, setImage] = useState("");
    const [imageSrc, setImageSrc] = useState("");
    const [urgent, setUrgent] = useState(false);

    const { token } = useContext(AuthContext)
    const [userId, setUserId] = useState()

    let publicImageStorageLink

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result);
        };
        reader.readAsDataURL(selectedFile);
    };

    let navigate = useNavigate();
    let { id } = useParams();

    useEffect(() => {
        isTool ? getTool(id) : setLoading(false);
    }, []);

    useEffect(() => {
        if(!token) 
            return
        
        setUserId(jwt_decode(token).sub)
    }, [token])

    const getTool = (id) => {
        // Setting loading to true when button is clicked
        setLoading(true);

        axios
            .get(`http://localhost:9003/api/tools/${id}`, {token})
            .then((response) => {
                setTool(response.data[0]);
                // Setting loading to false when request is read
                setLoading(false);
            })
            .catch((error) => console.error("Error: " + error));
    };

    const createReport = () => {
        setLoading(true)

        let idToSet
        { isTool ? idToSet = tool.id : idToSet = null }

        axios
            .post(`http://localhost:9003/api/report`, {
                token: token,
                title: subject,
                description: message,
                important: urgent,
                imageurl: publicImageStorageLink,
                tool_id: idToSet,
                user_id: userId
            })
            .then((response) => {
                setLoading(false)
                console.log(response)
                console.log(response.data[0])
                alert(`Report sent!`)
                { isTool ? navigate(`/tools/${tool.id}`) : navigate("/") }
            })
            .catch((error) => console.error("Error: " + error));
    }

    const submitReport = () => {
        if (!subject || !message)
            return alert("You need to fill in both subject and message.")

        setLoading(true);

        let formData = new FormData();
        formData.append("file", file);

        if (!file || !hasImageUpload) {
            createReport()
            return
        }

        axios
            .post(`http://localhost:9003/api/report/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "token": token
                },
            })
            .then((res) => {
                publicImageStorageLink = res.data.url.data.publicUrl
                console.log("Image uploaded successfully");
                createReport()
            })
            .catch((error) => console.error("Error: " + error));
    }

    return (
        <div>
            {loading ? (
                <div className="flex-col align-middle justify-center">
                    <ReactLoading type="spin" color="#9C528B" />
                </div>
            ) : (
                <form className="flex flex-col justify-center items-center mb-16 max-w-full">
                    <div>
                        {isTool ? <h1 className="text-2xl mb-5">Report tool "{tool.name}":</h1> : <h1 className="text-2xl mb-5">{title}</h1>}
                    </div>

                    <div className="mb-6 max-w-full md:w-96">
                        <label
                            htmlFor="subject"
                            className="block mb-2 text-sm font-medium text-eerie-black "
                        >
                            Subject (required):
                        </label>
                        <input
                            name="subject"
                            type="text"
                            className="bg-white border border-gray-300 text-eerie-black text-sm rounded-lg focus:ring-robin-egg-blue focus:border-robin-egg-blue block w-full p-2.5"
                            placeholder={isTool ? "Report about " + tool.name : placeholder}
                            onChange={(event) => setMessageSubject(event.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6 max-w-full md:w-96">
                        <label
                            htmlFor="message"
                            className="block mb-2 text-sm font-medium text-eerie-black "
                        >
                            Message (required):
                        </label>
                        <textarea
                            name="message"
                            type="text"
                            className="bg-white border border-gray-300 text-eerie-black text-sm rounded-lg focus:ring-robin-egg-blue focus:border-robin-egg-blue block w-full p-2.5 min-h-max max-h-48"
                            onChange={(event) => setMessage(event.target.value)}
                            required
                        />

                        {isTool ?
                            <div className="flex justify-center items-center flex-col mt-3">
                                <label htmlFor="broken">
                                    <input
                                        type="checkbox"
                                        checked={urgent}
                                        name="broken"
                                        onChange={(event) => setUrgent(!urgent)}
                                    />
                                    This report is urgent
                                </label>
                            </div>
                            : null}


                    </div>

                    {hasImageUpload ?

                        <label
                            htmlFor="file"
                            className="flex flex-col justify-center mb-2 text-sm font-medium text-eerie-black cursor-pointer"
                        >
                            <div className="h-40 w-60 rounded overflow-hidden bg-gray-200 flex justify-center items-center mt-7">
                                {image ? (
                                    <img
                                        src={image}
                                        alt={"Selected image"}
                                        className="h-full w-full object-cover"
                                    />
                                ) : null}
                            </div>
                            <div className="mt-2">
                                <input
                                    type="file"
                                    name="file"
                                    id="file"
                                    className="sr-only"
                                    accept="image/png, image/gif, image/jpeg"
                                    onChange={handleFileChange}
                                />
                                <label
                                    htmlFor="file"
                                    className="px-4 py-2 flex justify-center bg-gray-200 text-sm font-medium text-eerie-black rounded-md cursor-pointer hover:bg-gray-300"
                                >
                                    Choose image
                                </label>

                            </div>

                        </label>

                        :
                        null
                    }



                    <div className="flex flex-col justify-center items-center">
                        <Button
                            clickFunction={submitReport}
                            disabled={loading ? true : false}
                        >Submit Report</Button>
                        <Button link={"/tools/" + id}>Cancel</Button>
                    </div>
                </form>
            )}
        </div>
    );
}
