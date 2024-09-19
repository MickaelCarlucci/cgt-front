"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import 'pdfjs-dist/web/pdf_viewer.css';

export default function PdfViewer({ file }) {
  const canvasRef = useRef(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [renderTask, setRenderTask] = useState(null);
  const [pdfjsLib, setPdfjsLib] = useState(null); // Stocker pdfjsLib dans l'état

  // Charger pdfjsLib uniquement côté client
  useEffect(() => {
    async function loadPdfJsLib() {
      const pdfjs = await import('pdfjs-dist/webpack');
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      setPdfjsLib(pdfjs); // Stocker pdfjsLib dans l'état
    }
    loadPdfJsLib();
  }, []);

  // Fonction de rendu des pages
  const renderPage = useCallback((pdf, pageNum) => {
    if (!pdfjsLib) return; // Ne rien faire si pdfjsLib n'est pas encore chargé

    if (renderTask) {
      renderTask.cancel(); // Annuler la tâche de rendu précédente
    }

    pdf.getPage(pageNum).then((page) => {
      const scale = 1.3;
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const task = page.render(renderContext);
      setRenderTask(task);

      task.promise.then(() => {
        setRenderTask(null);
      }).catch((err) => {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Erreur lors du rendu de la page', err);
        }
      });
    });
  }, [pdfjsLib, renderTask]); // Ajout de pdfjsLib comme dépendance

  useEffect(() => {
    if (!pdfjsLib || !file) return; // Ne pas continuer si pdfjsLib ou file n'est pas prêt

    const loadingTask = pdfjsLib.getDocument(file);

    loadingTask.promise.then(
      (pdf) => {
        setPdfDocument(pdf);  // Stocker le document PDF
        setNumPages(pdf.numPages);  // Mettre à jour le nombre total de pages
        setPageNumber(1);  // Réinitialiser à la première page
      },
      (error) => {
        console.error('Erreur lors du chargement du PDF', error);
      }
    );
  }, [file, pdfjsLib]); // Attendre que pdfjsLib et file soient prêts

  useEffect(() => {
    if (pdfDocument) {
      renderPage(pdfDocument, pageNumber);  // Rendre la page
    }
  }, [pageNumber, pdfDocument, renderPage]);

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
      <div>
        <button onClick={() => setPageNumber(pageNumber - 1)} disabled={pageNumber <= 1}>
          Précédente
        </button>
        <button onClick={() => setPageNumber(pageNumber + 1)} disabled={pageNumber >= numPages}>
          Suivante
        </button>
        <p>
          Page {pageNumber} sur {numPages}
        </p>
      </div>
    </div>
  );
}
