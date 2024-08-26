"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const router = useRouter();
  const { token } = router.query;  // Récupération du token depuis les query params
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Vérifier si le token est présent
    if (token) {
      // Appel à l'API backend pour vérifier le token
      const verifyToken = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_API_URL}/api/users/verify?token=${token}`);
          const data = await response.json();
          if (response.ok) {
            setMessage('Votre compte a été vérifié avec succès');
          } else {
            setMessage(data.error || 'Une erreur est survenue');
          }
        } catch (error) {
          setMessage('Erreur lors de la vérification');
        }
      };

      verifyToken();
    }
  }, [token]);

  return (
    <div>
      <h1>Vérification de votre compte</h1>
      {message && <p>{message}</p>}
    </div>
  );
}