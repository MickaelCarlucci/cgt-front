"use client";

import { useState } from "react";
import "./page.css";

export default function Calculateur() {
  const [formData, setFormData] = useState({
    status: "",
    salariesBrut: "",
    rqth: false,
    dateNaissance: "",
    dateAnciennete: "",
    dateDepart: "",
    mutuelle: "0",
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const calculerIndemnite = () => {
    const {
      status,
      salariesBrut,
      rqth,
      dateNaissance,
      dateAnciennete,
      dateDepart,
      mutuelle,
    } = formData;

    if (
      !status ||
      !salariesBrut ||
      !dateAnciennete ||
      !dateDepart ||
      !dateNaissance
    ) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const salaireRef = parseFloat(salariesBrut) / 12;
    const dateAnc = new Date(dateAnciennete);
    const dateDep = new Date(dateDepart);
    const naissance = new Date(dateNaissance);
    const mutuelleValue = parseFloat(mutuelle);

    // Ancienneté en années complètes (mois et jours inclus)
    let anciennete = dateDep.getFullYear() - dateAnc.getFullYear();
    if (
      dateDep.getMonth() < dateAnc.getMonth() ||
      (dateDep.getMonth() === dateAnc.getMonth() &&
        dateDep.getDate() < dateAnc.getDate())
    ) {
      anciennete--;
    }

    // Âge au départ
    let age = dateDep.getFullYear() - naissance.getFullYear();
    if (
      dateDep.getMonth() < naissance.getMonth() ||
      (dateDep.getMonth() === naissance.getMonth() &&
        dateDep.getDate() < naissance.getDate())
    ) {
      age--;
    }

    // Indemnité légale
    let indemniteLegale = 0;
    let isPlafonnelegal = false;

    if (status === "non_cadres") {
      indemniteLegale += Math.min(10, anciennete) * (salaireRef * 0.25);
      indemniteLegale += Math.max(0, anciennete - 10) * (salaireRef * (1 / 3));
    } else if (status === "cadres") {
      indemniteLegale += Math.min(5, anciennete) * (salaireRef * 0.3);
      indemniteLegale +=
        Math.min(5, Math.max(0, anciennete - 5)) * (salaireRef * 0.4);
      indemniteLegale +=
        Math.min(5, Math.max(0, anciennete - 10)) * (salaireRef * 0.5);
      indemniteLegale += Math.max(0, anciennete - 15) * (salaireRef * 0.6);

      if (age >= 50 && age < 55) indemniteLegale *= 1.1;
      else if (age >= 55) indemniteLegale *= 1.25;

      if (indemniteLegale >= salaireRef * 18) {
        indemniteLegale = salaireRef * 18;
        isPlafonnelegal = true;
      }
    }

    // Indemnité spécifique
    const indemniteSpecifiqueParAn = 3000;
    const indemniteSpecifiqueInit = anciennete * indemniteSpecifiqueParAn;
    let indemniteSpecifique = indemniteSpecifiqueInit;

    const plafond = age >= 58 ? 90000 : 75000;
    let montantTotal = indemniteLegale + indemniteSpecifique;
    let isPlafonne = false;

    if (montantTotal > plafond) {
      indemniteSpecifique = Math.max(0, plafond - indemniteLegale);
      montantTotal = indemniteLegale + indemniteSpecifique;
      isPlafonne = true;
    }

    if (indemniteLegale >= plafond) {
      montantTotal = indemniteLegale;
      indemniteSpecifique = 0;
    }

    const dispositionRQTH = rqth ? indemniteLegale : 0;

    // Allocation brute et nette (avec mutuelle)
    let allocationBrute = salaireRef * 0.75;
    const allocationMin = 1801.8 * 0.85;
    if (allocationBrute < allocationMin) allocationBrute = allocationMin;

    const allocationNette = allocationBrute * (1 - 0.067) - mutuelleValue;

    const montantNetTotal =
      indemniteLegale +
      dispositionRQTH +
      (montantTotal - indemniteLegale) * 0.903;

    setResult({
      anciennete,
      age,
      salaireRef,
      indemniteLegale,
      indemniteSpecifique,
      montantTotal: montantTotal + dispositionRQTH,
      montantNetTotal,
      allocationBrute,
      allocationNette,
      plafond,
      isPlafonne,
      isPlafonnelegal,
      dispositionRQTH,
    });
  };

  return (
    <div className="container-calculator">
      <h1>Calculateur d&apos;Indemnité</h1>
      <table className="table-calculator">
        <tbody>
          <tr>
            <td>Statut :</td>
            <td>
              <select
                name="status"
                onChange={handleChange}
                value={formData.status}
              >
                <option value="">Sélectionnez</option>
                <option value="non_cadres">Non Cadres</option>
                <option value="cadres">Cadres</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Salaire Annuel Brut (€) :</td>
            <td>
              <input
                type="number"
                name="salariesBrut"
                onChange={handleChange}
                value={formData.salariesBrut}
              />
            </td>
          </tr>
          {/*
          <tr>
            <td>RQTH :</td>
            <td>
              <input
                type="checkbox"
                name="rqth"
                onChange={handleChange}
                checked={formData.rqth}
              />
            </td>
          </tr>
          */}
          <tr>
            <td>Date de naissance :</td>
            <td>
              <input
                type="date"
                name="dateNaissance"
                onChange={handleChange}
                value={formData.dateNaissance}
              />
            </td>
          </tr>
          <tr>
            <td>Date d&apos;ancienneté :</td>
            <td>
              <input
                type="date"
                name="dateAnciennete"
                onChange={handleChange}
                value={formData.dateAnciennete}
              />
            </td>
          </tr>
          <tr>
            <td>Date de départ :</td>
            <td>
              <input
                type="date"
                name="dateDepart"
                onChange={handleChange}
                value={formData.dateDepart}
              />
            </td>
          </tr>
          <tr>
            <td>Mutuelle :</td>
            <td>
              <select
                name="mutuelle"
                onChange={handleChange}
                value={formData.mutuelle}
              >
                <option value="0">Pas de cotisation</option>
                <option value="33.13">Isolée (33,13 €)</option>
                <option value="81.33">Familiale (81,33 €)</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>

      <button type="button" onClick={calculerIndemnite}>
        Calculer
      </button>

      {result && (
        <table className="result-table">
          <tbody>
            <tr>
              <th colSpan="2">INFORMATIONS GÉNÉRALES</th>
            </tr>
            <tr>
              <td>Votre ancienneté :</td>
              <td>{result.anciennete} ans</td>
            </tr>
            <tr>
              <td>Votre âge au départ :</td>
              <td>{result.age} ans</td>
            </tr>
            <tr>
              <td>Salaire de référence :</td>
              <td>{result.salaireRef.toFixed(2)} €</td>
            </tr>
            <tr>
              <td>Plafond appliqué :</td>
              <td>{result.plafond} €</td>
            </tr>

            <tr>
              <th colSpan="2">INDÉMNITÉS</th>
            </tr>
            <tr>
              <td>Indemnité légale :</td>
              <td>
                {result.indemniteLegale.toFixed(2)} €{" "}
                {result.isPlafonnelegal ? "(plafonnée à 18 mois)" : ""}
              </td>
            </tr>
            <tr>
              <td>Indemnité spécifique :</td>
              <td>
                {result.indemniteSpecifique.toFixed(2)} €{" "}
                {result.isPlafonne ? "(plafonnée)" : ""}
              </td>
            </tr>
            {result.dispositionRQTH > 0 && (
              <tr>
                <td>Disposition RQTH :</td>
                <td>{result.dispositionRQTH.toFixed(2)} €</td>
              </tr>
            )}
            <tr>
              <td>Montant Total Estimé :</td>
              <td>
                <strong>{result.montantTotal.toFixed(2)} €</strong>
              </td>
            </tr>
            <tr>
              <td>Montant net (CSG/CRDS déduites)* :</td>
              <td className="result-net">
                {result.montantNetTotal.toFixed(2)} €
              </td>
            </tr>

            <tr>
              <th colSpan="2">ALLOCATION MENSUELLE</th>
            </tr>
            <tr>
              <td>Brute :</td>
              <td>{result.allocationBrute.toFixed(2)} €</td>
            </tr>
            <tr>
              <td>Nette (après déductions et mutuelle) :</td>
              <td className="result-net">
                {result.allocationNette.toFixed(2)} €
              </td>
            </tr>
          </tbody>
        </table>
      )}

      <div className="little-mention-calculator">
        <p>
          * Certaines indemnités peuvent être partiellement exonérées de
          cotisations sociales ou d’impôts selon le cadre du départ (PSE, etc.).
        </p>
        <p>
          ** L’allocation brute ne peut être inférieure à 85% du SMIC (soit
          1531,53 €).
        </p>
        <p>
          *** La CSG applicable est réduite à 6,2% pour l’allocation de
          reclassement.
        </p>
      </div>

      <p className="dedicace">© 2025 Didier - Tous droits réservés</p>
    </div>
  );
}
