"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import 'pdfjs-dist/web/pdf_viewer.css';

export default function PdfViewer({ file }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null); // Référence pour le conteneur
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [renderTask, setRenderTask] = useState(null);
  const [pdfjsLib, setPdfjsLib] = useState(null); // Stocker pdfjsLib dans l'état
  const [isRendering, setIsRendering] = useState(false); // Empêcher le rendu multiple

  const minScale = 1.3; // Échelle minimale pour la lisibilité
  const defaultScale = 1.5; // Échelle par défaut si la taille le permet

  // Charger pdfjsLib uniquement côté client
  useEffect(() => {
    async function loadPdfJsLib() {
      const pdfjs = await import('pdfjs-dist/webpack');
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      setPdfjsLib(pdfjs); // Stocker pdfjsLib dans l'état
    }
    loadPdfJsLib();
  }, []);

  useEffect(() => {
    if (!pdfjsLib || !file || !containerRef.current) return; // Ne pas continuer si pdfjsLib, file, ou containerRef n'est pas prêt
  
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
  }, [file, pdfjsLib, containerRef]); // Attendre que pdfjsLib, file et containerRef soient prêts
  

  // Fonction de rendu des pages
  const renderPage = useCallback((pdf, pageNum) => {
    if (isRendering) {
      return; // Empêche plusieurs rendus en même temps
    }

    setIsRendering(true); // Indique qu'un rendu est en cours

    // Annuler la tâche de rendu précédente, si elle existe
    if (renderTask) {
      renderTask.cancel();  // Annuler la tâche précédente
    }

    pdf.getPage(pageNum).then((page) => {
      const containerWidth = containerRef.current.offsetWidth; // Obtenir la largeur du conteneur
      const viewport = page.getViewport({ scale: defaultScale });

      // Calculer l'échelle dynamique en fonction de la taille du conteneur
      const scale = Math.max(containerWidth / viewport.width, minScale); // Limiter l'échelle à minScale pour éviter que le texte ne devienne trop petit
      const scaledViewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };

      // Lancer la tâche de rendu de la nouvelle page
      const task = page.render(renderContext);
      setRenderTask(task);  // Mettre à jour la tâche de rendu dans l'état

      task.promise.then(() => {
        setIsRendering(false); // Rendu terminé
        setRenderTask(null);  // Tâche terminée, la nettoyer
      }).catch((err) => {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Erreur lors du rendu de la page', err);
        }
        setIsRendering(false); // Rendu terminé même en cas d'erreur
      });
    });
  }, [isRendering, renderTask]);

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

  // Rendre la page lorsque le numéro de page ou le document change
  useEffect(() => {
    if (pdfDocument) {
      renderPage(pdfDocument, pageNumber);  // Rendre la page
    }
  }, [pageNumber, pdfDocument, renderPage]);

  // Fonction pour passer à la page précédente
  const goToPrevPage = () => {
    if (pageNumber > 1 && !isRendering) {
      setPageNumber((prevPage) => prevPage - 1);
    }
  };

  // Fonction pour passer à la page suivante
  const goToNextPage = () => {
    if (pageNumber < numPages && !isRendering) {
      setPageNumber((prevPage) => prevPage + 1);
    }
  };

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: 'auto' }}></canvas>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button onClick={goToPrevPage} disabled={pageNumber <= 1 || isRendering}>
          Précédente
        </button>
        <button onClick={goToNextPage} disabled={pageNumber >= numPages || isRendering}>
          Suivante
        </button>
        <p>
          Page {pageNumber} sur {numPages}
        </p>
      </div>
    </div>
  );
}
