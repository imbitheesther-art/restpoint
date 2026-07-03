import React, { useState, useEffect } from 'react'
import axios from 'axios';
import ReactLoading from 'react-loading'
import ToolCard from '../components/ToolCard';

export default function ToolCards() {
  const [loading, setLoading] = useState(true)
  const [tools, setTools] = useState([])


  useEffect(() => {
    getTools()
  }, []);

  const getTools = () => {
    axios.get(`https://wms-api-ps1s.onrender.com/api/tools`)
      .then((response) => {
        // Ensure response.data is an array before setting it
        if (Array.isArray(response.data)) {
          setTools(response.data)
        } else if (response.data && Array.isArray(response.data.tools)) {
          // If the API returns an object with a tools property
          setTools(response.data.tools)
        } else {
          // Fallback to empty array if data is not in expected format
          console.warn("API returned unexpected data format:", response.data)
          setTools([])
        }
        setLoading(false)
      })
      .catch(error => {
        console.error("Error: " + error)
        setTools([])
        setLoading(false)
      })
  }

  const toolCards = tools.map((tool, key) => <ToolCard key={key} id={tool.id} src={tool.imageurl} name={tool.name} paragraph={tool.description} />)


  return (
    <div className='flex flex-wrap justify-center gap-6 mx-6'>
      {loading ? <ReactLoading type='spin' color='#9C528B' /> : toolCards}
    </div>
  )
}