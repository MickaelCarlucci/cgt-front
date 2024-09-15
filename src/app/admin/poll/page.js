// pages/create-poll.js
"use client"

import { useState } from 'react';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import "./page.css";

export default function Page() {
    const { data: session, status } = useSession();
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['']);  // On initialise avec une option vide
    const roles = session?.user?.roles?.split(", ") || [];

    // Fonction pour ajouter une nouvelle option
    const addOption = () => {
        setOptions([...options, '']);  // Ajoute une nouvelle option vide
    };

    // Fonction pour supprimer une option
    const removeOption = (index) => {
        const newOptions = options.filter((_, i) => i !== index);  // Retirer l'option d'index donné
        setOptions(newOptions);
    };

    // Fonction pour mettre à jour une option
    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    // Gestion de la soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();  // Empêche la soumission par défaut

        // Envoie les données à l'API route
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poll/newPoll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question,
                options: options.filter(option => option.trim() !== '')  // Ne garde que les options non vides
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Sondage créé:', data);

            // Réinitialisation du formulaire après succès
            setQuestion('');  // Remettre la question à zéro
            setOptions(['']);  // Remettre une seule option vide
        } else {
            console.error('Erreur lors de la création du sondage');
        }
    };

    return (
        <>
        {roles.includes("Admin") || roles.includes("SuperAdmin") ? (
        <div>
            <h2>Créer un sondage</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="question">Question:</label><br/>
                    <input
                        type="text"
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        required
                    /><br/><br/>
                </div>

                <div id="optionsContainer">
                    {options.map((option, index) => (
                        <div key={index}>
                            <label htmlFor={`option${index + 1}`}>Option {index + 1}:</label><br/>
                            <input
                                type="text"
                                id={`option${index + 1}`}
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                required
                            />
                            <button type="button" onClick={() => removeOption(index)} disabled={options.length === 1}>
                                Supprimer
                            </button>
                            <br/><br/>
                        </div>
                    ))}
                </div>

                <button type="button" onClick={addOption}>
                    Ajouter une option
                </button><br/><br/>

                <button type="submit">Créer le sondage</button>
            </form>
        </div>
        ) : ( 
            <p>
        Vous ne devriez pas être ici ! Revenez à la page d&apos;
        <Link href="/">accueil</Link>
      </p>
    )}
        </>
    );
}
