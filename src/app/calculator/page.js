"use client";

import { useState } from "react";
import "./page.css";

export default function Page() {
  const [resultat, setResultat] = useState(null);
  const [rqth, setRqth] = useState(false);
  const [mutuelle, setMutuelle] = useState(0);

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

    const salaireReference = salariesBrut / 12;
    let indemniteLegale = 0;

    if (status === "non_cadres") {
      indemniteLegale += Math.min(10, anciennete) * (salaireReference * 0.25);
      indemniteLegale +=
        Math.max(0, anciennete - 10) * (salaireReference * (1 / 3));
    } else {
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
    let isPlafonne = false;

    if (montantTotal > plafond) {
      indemniteSpecifique = plafond - indemniteLegale;
      montantTotal = plafond;
      isPlafonne = true;
    }

    let allocationMensuelleBrute = salaireReference * 0.75;
    const allocationMinimale = 1801.8 * 0.85;
    if (allocationMensuelleBrute < allocationMinimale) {
      allocationMensuelleBrute = allocationMinimale;
    }

    let allocationMensuelleNette =
      allocationMensuelleBrute * (1 - 0.067) - mutuelle;
    let dispositionRQTH = rqth ? indemniteLegale : 0;
    const montantNetTotal =
      indemniteLegale +
      dispositionRQTH +
      (montantTotal - indemniteLegale) * 0.903;

    setResultat({
      anciennete,
      age,
      salaireReference,
      plafond,
      indemniteLegale,
      indemniteSpecifique,
      montantTotal,
      montantNetTotal,
      allocationMensuelleBrute,
      allocationMensuelleNette,
      dispositionRQTH,
      isPlafonne,
    });
  };

  return (
    <div className="container-calculator">
      <h1>Calculateur d&apos;Indemnité</h1>
      <p>Les informations saisies ne sont pas conservées.</p>

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
              <label>Salarié RQTH :</label>
            </td>
            <td>
              <input
                type="checkbox"
                checked={rqth}
                onChange={() => setRqth(!rqth)}
              />
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
        <div className="result-table">
          <h2>Résultats :</h2>
          <p>Votre ancienneté : {resultat.anciennete} ans</p>
          <p>Indemnité légale : {resultat.indemniteLegale.toFixed(2)} €</p>
          <p>
            Indemnité spécifique : {resultat.indemniteSpecifique.toFixed(2)} €
          </p>
          <p>
            Montant Total Estimé : {resultat.montantTotal.toFixed(2)} €{" "}
            {resultat.isPlafonne ? "(plafonné)" : ""}
          </p>
          <p className="result-net">
            Montant net (après CSG/CRDS) : {resultat.montantNetTotal.toFixed(2)}{" "}
            €
          </p>
          <p className="result-net">
            Allocation mensuelle nette :{" "}
            {resultat.allocationMensuelleNette.toFixed(2)} €
          </p>
        </div>
      )}
      <div className="dedicace">
        <p>© 2025 Didier - Tous droits réservés </p>
      </div>
    </div>
  );
}
