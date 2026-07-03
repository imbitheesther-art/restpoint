import React from 'react'

export default function Tool(props) {
  return (
    <body>
    <div className='flex justify-center flex-col items-center'>
      <img className='w-64 h-48 p-2' src={props.src} alt={props.alt} />
      <h1 className='text-4xl font-bold '>{props.name}</h1>
      <p>{props.paragraph}</p>
      <h2 className='text-4xl font-bold'>{props.other}</h2>
      <p>{props.otherParagraph}</p>
      
      <label>Start date:</label>
      <input type="date" name="start" min="2023-01-01" max="2024-12-31"/>
      <label>End date:</label>
      <input type="date" name="end" min="2023-01-01" max="2024-12-31"/>
      </div>

    </body>
  )
}
