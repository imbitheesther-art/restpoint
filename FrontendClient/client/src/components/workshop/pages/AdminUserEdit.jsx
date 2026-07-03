import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/Button"
import ReactLoading from 'react-loading'

const defaultUser = {
  id: "loading",
  first_name: "firstname",
  last_name: "lastname",
  email: "email"
};



export default function AdminUserEdit(props) {
  const [user, setUser] = useState(defaultUser);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  let navigate = useNavigate();
  let { id } = useParams();

  useEffect(() => {
    { props.edit ? getUser(id) : setLoading(false) }
  }, []);

  const getUser = (id) => {
    // Setting loading to true when button is clicked
    setLoading(true)


    axios
      .get(`https://wms-api-ps1s.onrender.com/api/users/${id}`)
      .then((response) => {
        setUser(response.data[0]);
        setFirstName(response.data[0].first_name)
        setLastName(response.data[0].last_name)
        setEmail(response.data[0].email)

        // Setting loading to false when request is read
        setLoading(false);
      })
      .catch((error) => console.error("Error: " + error));
  };

  const updateUser = () => {
    axios
      .patch(`https://wms-api-ps1s.onrender.com/api/users/${id}`, {
        first_name: firstName,
        last_name: lastName,
        email: email
      })
      .then((response) => {
        console.log(response.data[0])
        alert(`User ${response.data[0].first_name} updated.`)
        navigate(`/admin/user/${id}`)
      })
  }


  const deleteUser = () => {
    setLoading(true)
    axios
      .delete(`https://wms-api-ps1s.onrender.com/api/users/${id}`)
      .then((response) => {
        alert(`User ${response.data[0].first_name} deleted.`)
        navigate("/admin")
        setLoading(false)
      })
      .catch((error) => console.error("Error: " + error));
  }

  const createUser = () => {
    setLoading(true)
    axios
      .post(`https://wms-api-ps1s.onrender.com/api/register`, {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password
      })
      .then((response) => {
        console.log(response.data[0])
        alert(`User ${response.data[0].first_name} created.`)
        // We could navigate directly to the user edit page here, but this may be confusing
        // navigate(`/admin/user/${response.data[0].id}`)
        // Chose to direct back to the admins instead to see the updated list.
        navigate("/admin")

        setLoading(false)
      })
      .catch((error) => console.error("Error: " + error));
  }

  return (
    <div>
      {loading ? <div className="flex flex-col justify-center items-center mb-16"><ReactLoading type='spin' color='#9C528B' /></div> :
        <form className="flex flex-col justify-center items-center mb-16">
          <div>
          <h1 className="text-2xl md:text-3xl">{props.edit ? "Edit user:": "Create a new user:"}</h1>
          </div>
          <div className="mb-6 w-96">
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-eerie-black">First Name:</label>
            <input name="firstname" type="text" className="bg-white border border-gray-300 text-eerie-black text-sm rounded-lg focus:ring-robin-egg-blue focus:border-robin-egg-blue block w-full p-2.5"
              placeholder={props.edit ? firstName : "Navn"}
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required />
          </div>

          <div className="mb-6 w-96">
            <label htmlFor="lastname" className="block mb-2 text-sm font-medium text-eerie-black ">Last Name:</label>
            <input name="lastname" type="text" className="bg-white border border-gray-300 text-eerie-black text-sm rounded-lg focus:ring-robin-egg-blue focus:border-robin-egg-blue block w-full p-2.5"
              placeholder={props.edit ? lastName : "Navnesen"}
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required />
          </div>

          <div className="mb-6 w-96">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-eerie-black ">Email:</label>
            <input name="email" type="email" className="bg-white border border-gray-300 text-eerie-black text-sm rounded-lg focus:ring-robin-egg-blue focus:border-robin-egg-blue block w-full p-2.5"
              placeholder={props.edit ? email : "navn.navnesen@email.no"}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required />
          </div>

          <div className="mb-6 w-96">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-eerie-black ">{props.edit ? "Set new password:" : "Password:"} </label>
            <input name="password" type="password" className="bg-white border border-gray-300 text-eerie-black text-sm rounded-lg focus:ring-robin-egg-blue focus:border-robin-egg-blue block w-full p-2.5" placeholder=""
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required />
          </div>

          <div className="flex flex-col justify-center items-center">
            <Button clickFunction={props.edit ? updateUser : createUser}>{props.edit ? "Edit" : "Create User"}</Button>
            <Button link="/admin">Cancel</Button>
            {props.edit ? <Button warning={true} clickFunction={deleteUser}>Delete User</Button> : null}
          </div>

        </form>
      }
    </div>
  );
}
