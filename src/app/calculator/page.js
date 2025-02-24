"use client";

import { useState } from "react";
import "./page.css";

export default function Page() {
  const [resultat, setResultat] = useState(null);

  const calculerIndemnite = () => {
    const status = document.getElementById("status").value;
    const salariesBrut = parseFloat(
      document.getElementById("salariesBrut").value
    );
    const dateNaissance = new Date(
      document.getElementById("dateNaissance").value
    );
    const dateAnciennete = new Date(
      document.getElementById("dateAnciennete").value
    );
    const dateDepart = new Date(document.getElementById("dateDepart").value);

    let anciennete = dateDepart.getFullYear() - dateAnciennete.getFullYear();
    if (
      dateDepart.getMonth() < dateAnciennete.getMonth() ||
      (dateDepart.getMonth() === dateAnciennete.getMonth() &&
        dateDepart.getDate() < dateAnciennete.getDate())
    ) {
      anciennete--;
    }

    const salaireReference =
      status === "non_cadres" ? salariesBrut / 12 : salariesBrut / 18;

    let indemniteLegale = 0;
    if (status === "non_cadres") {
      indemniteLegale += Math.min(10, anciennete) * (salaireReference * 0.25);
      indemniteLegale +=
        Math.max(0, anciennete - 10) * (salaireReference * (1 / 3));
    } else if (status === "cadres") {
      indemniteLegale +=
        Math.min(5, anciennete) * (salaireReference * (3 / 10));
      indemniteLegale +=
        Math.min(5, Math.max(0, anciennete - 5)) *
        (salaireReference * (4 / 10));
      indemniteLegale +=
        Math.min(5, Math.max(0, anciennete - 10)) *
        (salaireReference * (5 / 10));
      indemniteLegale +=
        Math.max(0, anciennete - 15) * (salaireReference * (6 / 10));
    }

    const age = Math.floor(
      (dateDepart - dateNaissance) / (1000 * 60 * 60 * 24 * 365)
    );
    if (age >= 50 && age < 55) indemniteLegale *= 1.1;
    else if (age >= 55) indemniteLegale *= 1.25;

    const montantSpecifiqueParAnnee = 3000;
    let indemniteSpecifique = anciennete * montantSpecifiqueParAnnee;
    const plafond = age >= 58 ? 90000 : 70000;

    let montantTotal = indemniteLegale + indemniteSpecifique;
    if (montantTotal > plafond) {
      indemniteSpecifique = plafond - indemniteLegale;
      montantTotal = plafond;
    }

    setResultat({
      anciennete,
      age,
      salaireReference: salaireReference.toFixed(2),
      plafond,
      indemniteLegale: indemniteLegale.toFixed(2),
      indemniteSpecifique: indemniteSpecifique.toFixed(2),
      montantTotal: montantTotal.toFixed(2),
      montantNet: (
        indemniteLegale +
        (montantTotal - indemniteLegale) * 0.903
      ).toFixed(2),
    });
  };

  return (
    <div className="container-calculator">
      <h1>Calculateur d&apos;Indemnité</h1>
      <p>
        Les informations que vous saisissez ci-dessous ne sont pas enregistrées
      </p>

      <table className="table-calculator">
        <tbody>
          <tr>
            <td>
              <label>Statut :</label>
            </td>
            <td>
              <select id="status" required>
                <option value="">Sélectionnez</option>
                <option value="non_cadres">Non Cadres</option>
                <option value="cadres">Cadres</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>
              <label>Salaire Annuel Brut (€) :</label>
            </td>
            <td>
              <input type="number" id="salariesBrut" step="0.01" required />
            </td>
          </tr>
          <tr>
            <td>
              <label>Date de naissance :</label>
            </td>
            <td>
              <input type="date" id="dateNaissance" required />
            </td>
          </tr>
          <tr>
            <td>
              <label>Date d&apos;ancienneté :</label>
            </td>
            <td>
              <input type="date" id="dateAnciennete" required />
            </td>
          </tr>
          <tr>
            <td>
              <label>Date de départ :</label>
            </td>
            <td>
              <input type="date" id="dateDepart" required />
            </td>
          </tr>
          <tr>
            <td colSpan="2">
              <button onClick={calculerIndemnite}>Calculer</button>
            </td>
          </tr>
        </tbody>
      </table>

      {resultat && (
        <div>
          <h2>Résultats :</h2>
          <table className="result-table">
            <tbody>
              <tr>
                <td>Votre ancienneté :</td>
                <td>{resultat.anciennete} ans</td>
              </tr>
              <tr>
                <td>Votre âge au départ :</td>
                <td>{resultat.age} ans</td>
              </tr>
              <tr>
                <td>Salaire de référence :</td>
                <td>{resultat.salaireReference} €</td>
              </tr>
              <tr>
                <td>Plafond appliqué :</td>
                <td>{resultat.plafond} €</td>
              </tr>
              <tr>
                <td>Indemnité légale :</td>
                <td>{resultat.indemniteLegale} €</td>
              </tr>
              <tr>
                <td>Indemnité spécifique :</td>
                <td>{resultat.indemniteSpecifique} €</td>
              </tr>
              <tr>
                <td>
                  <strong>MONTANT TOTAL ESTIMÉ :</strong>
                </td>
                <td>{resultat.montantTotal} €</td>
              </tr>
              <tr>
                <td>Montant net :</td>
                <td className="result-net">{resultat.montantNet} €</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
