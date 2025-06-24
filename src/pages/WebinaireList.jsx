// WebinaireList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const WebinaireList = () => {
  const [webinaires, setWebinaires] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/api/webinars/")
      .then(res => setWebinaires(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Webinaires à venir</h2>
      <ul>
        {webinaires.map(w => (
          <li key={w.id}>
            <h3>{w.title}</h3>
            <p>{w.description}</p>
            <p><strong>Date :</strong> {new Date(w.date).toLocaleString()}</p>
            <a href={w.link} target="_blank" rel="noreferrer">Rejoindre</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WebinaireList;
