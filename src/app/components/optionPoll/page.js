"use client"
import { useState, useEffect } from "react";
import './page.css'

const PollDetails = ({ pollId, onVote }) => {
    const [options, setOptions] = useState([]);
  
    useEffect(() => {
      async function fetchOptions() {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poll/${pollId}/options`);
          const data = await response.json();
          setOptions(data);
        } catch (error) {
          console.error('Erreur lors de la récupération des options:', error);
        }
      }
  
      fetchOptions();
    }, [pollId]);
  
    return (
      <div className="option-container">
        <h2>Options de vote</h2>
        <ul>
          {options.map((option) => (
            <li key={option.id}>
              <button onClick={() => onVote(pollId, option.id)}>
                {option.option}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  export default PollDetails;