"use client"
import { useState, useEffect } from "react";
import './page.css';

const PollResults = ({ pollId }) => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poll/${pollId}/options`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des résultats du sondage:", error);
      }
    }

    fetchResults();
  }, [pollId]);

  const totalVotes = results.reduce((acc, result) => acc + result.vote, 0);

  return (
    <div className="results-container">
      <h2>Résultats du sondage</h2>
      <ul>
        {results.map((result) => {
          const percentage = totalVotes > 0 ? (result.vote / totalVotes) * 100 : 0;
          return (
            <li key={result.id}>
              <div className="result-item">
                <span>{result.option}: {result.vote} vote{result.vote > 1 ? "s" : ""} ({percentage.toFixed(2)}%)</span>
                <div className="bar-container">
                  {/* La barre prend le pourcentage et l'animation démarre */}
                  <div className="bar" style={{ '--bar-width': `${percentage}%` }}></div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PollResults;
