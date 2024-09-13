import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import 'pdfjs-dist/web/pdf_viewer.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfViewer({ file }) {
  const canvasRef = useRef(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [renderTask, setRenderTask] = useState(null);

  // Fonction de rendu des pages
  const renderPage = (pdf, pageNum) => {
    if (renderTask) {
      renderTask.cancel(); // Annuler la tâche de rendu en cours si elle existe
    }

    pdf.getPage(pageNum).then((page) => {

      const scale = 1.3;
      const viewport = page.getViewport({ scale });

      // S'assurer que le canvas existe avant d'accéder à son contexte
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('Canvas is not available');
        return;
      }

      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      // Démarrer une nouvelle tâche de rendu et l'enregistrer dans l'état
      const newRenderTask = page.render(renderContext);
      setRenderTask(newRenderTask);

      newRenderTask.promise
        .then(() => {
          setRenderTask(null); // Libérer la tâche de rendu après son achèvement
        })
        .catch((err) => {
          if (err.name === 'RenderingCancelledException') {
            console.log('Le rendu a été annulé, ce qui est normal lors du changement de page.');
          } else {
            console.error('Erreur lors du rendu de la page', err);
          }
        });
    });
  };

  // Chargement initial du document PDF
  useEffect(() => {
    if (!file) return;

    const loadingTask = pdfjsLib.getDocument(file);

    loadingTask.promise.then(
      (pdf) => {
        setPdfDocument(pdf); // Enregistrer le PDF chargé dans l'état
        setNumPages(pdf.numPages);
        renderPage(pdf, pageNumber); // Rendre la première page du PDF
      },
      (error) => {
        console.error('Erreur lors du chargement du PDF', error);
      }
    );
  }, [file]); // Seule la modification du fichier déclenche ce `useEffect`

  // Effet pour rendre la page lorsque le numéro de page ou le PDF change
  useEffect(() => {
    if (pdfDocument) {
      renderPage(pdfDocument, pageNumber);
    }
  }, [pageNumber, pdfDocument]); // Réagir seulement quand `pageNumber` ou `pdfDocument` change

  // Fonction pour passer à la page précédente
  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  // Fonction pour passer à la page suivante
  const goToNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
      <div>
        <button onClick={goToPrevPage} disabled={pageNumber <= 1}>
          Précédente
        </button>
        <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
          Suivante
        </button>
        <p>
          Page {pageNumber} sur {numPages}
        </p>
      </div>
    </div>
  );
}
