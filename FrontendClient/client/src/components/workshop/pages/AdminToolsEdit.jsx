import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import ReactLoading from "react-loading";

const defaultTool = {
  id: "loading",
  name: "name",
  description: "description",
};

export default function AdminToolEdit(props) {
  const [tool, setTool] = useState(defaultTool);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(0);
  const [broken, setBroken] = useState(false);
  const [dangerous, setDangerous] = useState(false);
  const [visible, setVisible] = useState(false);
  const [file, setFile] = useState("");
  const [image, setImage] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [allLocations, setAllLocations] = useState([]);

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
    {
      props.edit ? getTool(id) : getLocations();
    }
  }, []);

  const getLocations = () => {
    axios
      .get(`https://wms-api-ps1s.onrender.com/api/locations`)
      .then((response2) => {
        setAllLocations(response2.data);
        setLoading(false);
      })
      .catch((error) => console.error("Error: " + error));
  };

  const getTool = (id) => {
    // Setting loading to true when button is clicked
    setLoading(true);

    axios
      .get(`https://wms-api-ps1s.onrender.com/api/locations`)
      .then((response2) => {
        setAllLocations(response2.data);
        axios
          .get(`https://wms-api-ps1s.onrender.com/api/tools/${id}`)
          .then((response) => {
            setTool(response.data[0]);
            setName(response.data[0].name);
            setDescription(response.data[0].description);
            setLocation(response.data[0].location_id);
            setBroken(response.data[0].broken);
            setDangerous(response.data[0].dangerous);
            setVisible(response.data[0].visible);
            setImageSrc(response.data[0].current_image);

            // Setting loading to false when request is read
            setLoading(false);
          })
          .catch((error) => console.error("Error: " + error));
      })
      .catch((error) => console.error("Error: " + error));
  };

  const fixTool = (update) => {
    let formData = new FormData();
    formData.append("file", file);

    if(!file) {
      if (update){
        updateTool()
      } else {
        createTool()
      }

      return
      
    }

    axios
      .post(`https://wms-api-ps1s.onrender.com/api/tools/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        publicImageStorageLink = res.data.url.data.publicUrl
        console.log("Image uploaded successfully");
        if (update){
          updateTool()
        } else {
          createTool()
        }
      })
      .catch((err) => {
        res.json({ err });
      });

  };

  const updateToolFixed = () => {
    fixTool(true)
  }

  const createToolFixed = () => {
    fixTool(false)
  }

  const updateTool = () => {
    axios
      .patch(`https://wms-api-ps1s.onrender.com/api/tools/${id}`, {
        name: name,
        imageurl: publicImageStorageLink,
        description: description,
        location_id: location,
        broken: broken,
        dangerous: dangerous,
        visible: visible,
      })
      .then((response) => {
        console.log(response.data[0]);
        alert(`Tool ${response.data[0].name} updated.`);
        navigate(`/tools`);
      });
  }

  const deleteTool = async () => {
    setLoading(true);

    await axios
      .delete(`https://wms-api-ps1s.onrender.com/api/tools/${id}`)
      .then((response) => {
        alert(`tool ${response.data[0].name} deleted.`);
        navigate("/tools");
        setLoading(false);
      })
      .catch((error) => console.error("Error: " + error));
  };

  const createTool = async () => {
    setLoading(true);

    await axios
      .post(`https://wms-api-ps1s.onrender.com/api/tools/`, {
        name: name,
        imageurl: publicImageStorageLink,
        description: description,
        location_id: location,
        broken: broken,
        dangerous: dangerous,
        visible: visible,
      })
      .then((response) => {
        console.log(response.data[0]);
        alert(`Tool ${response.data[0].name} created.`);

        navigate("/tools");

        setLoading(false);
      })
      .catch((error) => console.error("Error: " + error));
  };

  return (
    <div>
      {loading ? (
        <div className="flex flex-col justify-center items-center mb-16"><ReactLoading type='spin' color='#9C528B' /></div>
      ) : (
        <form className="flex flex-col justify-center items-center mb-16 max-w-full">
          <div>
            <h1 className="text-2xl md:text-3xl">{props.edit ? "Edit tool:": "Create a new tool:"}</h1>
          </div>
          <label
            htmlFor="file"
            className="flex flex-col justify-center mb-2 text-sm font-medium text-eerie-black cursor-pointer"
          >
            <div className="h-40 w-40 rounded overflow-hidden bg-gray-200 flex justify-center items-center mt-7">
              {image ? (
                <img
                  src={image}
                  alt={"Selected image"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={tool.imageurl}
                  alt={tool.alt}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="mt-2">
              <input
                type="file"
                id="file"
                name="file"
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

          <div className="mb-6 max-w-full md:w-96">
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-eerie-black "
            >
              Name:
            </label>
            <input
              name="name"
              type="text"
              className="bg-white border border-gray-300 text-eerie-black text-sm rounded-lg focus:ring-robin-egg-blue focus:border-robin-egg-blue block w-full p-2.5"
              placeholder={props.edit ? tool.name : "Hammer"}
              defaultValue={props.edit ? tool.name : ""}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="mb-6 max-w-full md:w-96">
            <label
              htmlFor="description"
              className="block mb-2 text-sm font-medium text-eerie-black "
            >
              Description
            </label>
            <textarea
              name="description"
              type="text"
              className="bg-white border border-gray-300 text-eerie-black text-sm rounded-lg focus:ring-robin-egg-blue focus:border-robin-egg-blue block w-full p-2.5 max-h-48"
              placeholder={props.edit ? tool.description : "description"}
              defaultValue={props.edit ? tool.description : ""}
              onChange={(event) => setDescription(event.target.value)}
              required
            />

            <label
              htmlFor="location"
              className="block mb-2 text-sm font-medium text-eerie-black "
            >
              Location:
            </label>
            <select
              name="location"
              id="location"
              className="bg-white border border-gray-300 text-eerie-black text-sm rounded-lg focus:ring-robin-egg-blue focus:border-robin-egg-blue block w-full p-2.5"
              onChange={(event) => setLocation(event.target.value)}
              value={location}
            >
              {allLocations.map((loc) => (
                <option value={loc.location_id}>{loc.location}</option>
              ))}
            </select>

            <div className="flex justify-center items-center flex-col">
              <label htmlFor="broken">
                <input
                  type="checkbox"
                  checked={broken}
                  name="broken"
                  onChange={(event) => setBroken(!broken)}
                />
                Broken
              </label>

              <label htmlFor="dangerous">
                <input
                  type="checkbox"
                  checked={dangerous}
                  name="dangerous"
                  onChange={(event) => setDangerous(!dangerous)}
                />
                Dangerous
              </label>

              <label htmlFor="visible">
                <input
                  type="checkbox"
                  name="visible"
                  checked={visible}
                  onChange={(event) => setVisible(!visible)}
                />
                Visible
              </label>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <Button
              clickFunction={props.edit ? updateToolFixed : createToolFixed}
              disabled={loading ? true : false}
            >Edit</Button>
            <Button link="/tools">Cancel</Button>
            {props.edit ? (
              <Button
                warning={true}
                clickFunction={deleteTool}
              >Delete Tool</Button>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}
