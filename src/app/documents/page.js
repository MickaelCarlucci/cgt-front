"use client"

import { useState, useEffect } from 'react';
import PdfViewer from '../components/pdfViewer/pdfViewer';

export default function PdfPage() {
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);

  useEffect(() => {
    async function fetchPdfs() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pdf/views`);
      const data = await res.json();
      setPdfs(data);
    }

    fetchPdfs();
  }, []);

  return (
    <div>
      <h1>Liste des PDF</h1>
      <ul>
        {pdfs.map((pdf) => (
          <li key={pdf.id}>
            <button onClick={() => setSelectedPdf(`${process.env.NEXT_PUBLIC_API_URL}${pdf.pdf_url}`)}>
              {pdf.title}
            </button>
          </li>
        ))}
      </ul>

      {selectedPdf && (
        <div>
          <h2>Visualisation du PDF</h2>
          <PdfViewer file={selectedPdf} />
        </div>
      )}
    </div>
  );
}