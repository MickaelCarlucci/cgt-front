"use client"
import { useState, useEffect } from "react";

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

  return (
    <div>
      <h2>Résultats du sondage</h2>
      <ul>
        {results.map((result) => (
          <li key={result.id}>
            {result.option}: {result.vote} vote{result.vote > 1 ? "s" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PollResults;
