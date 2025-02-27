"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import "pdfjs-dist/web/pdf_viewer.css";

export default function PdfViewer({ file }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [renderTask, setRenderTask] = useState(null);
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [isRendering, setIsRendering] = useState(false);

  const minScale = 1.3;
  const defaultScale = 1.5;

  useEffect(() => {
    async function loadPdfJsLib() {
      const pdfjs = await import("pdfjs-dist/webpack");

      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      setPdfjsLib(pdfjs);
    }
    loadPdfJsLib();
  }, []);

  useEffect(() => {
    if (!pdfjsLib || !file || !containerRef.current) return;

    const loadingTask = pdfjsLib.getDocument(file);

    loadingTask.promise.then(
      (pdf) => {
        setPdfDocument(pdf);

        setNumPages(pdf.numPages);

        setPageNumber(1);
      },
      (error) => {
        console.error("Erreur lors du chargement du PDF", error);
      }
    );
  }, [file, pdfjsLib, containerRef]);

  const renderPage = useCallback(
    (pdf, pageNum) => {
      if (isRendering) {
        return;
      }

      setIsRendering(true);

      if (renderTask) {
        renderTask.cancel();
      }

      pdf.getPage(pageNum).then((page) => {
        const containerWidth = containerRef.current.offsetWidth;
        const viewport = page.getViewport({ scale: defaultScale });

        const scale = Math.max(containerWidth / viewport.width, minScale);
        const scaledViewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };

        const task = page.render(renderContext);

        setRenderTask(task);

        task.promise
          .then(() => {
            setIsRendering(false);
            setRenderTask(null);
          })
          .catch((err) => {
            if (err.name !== "RenderingCancelledException") {
              console.error("Erreur lors du rendu de la page", err);
            }
            setIsRendering(false);
          });
      });
    },
    [isRendering, renderTask]
  );

  useEffect(() => {
    if (!pdfjsLib || !file) return;

    const loadingTask = pdfjsLib.getDocument(file);

    loadingTask.promise.then(
      (pdf) => {
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        setPageNumber(1);
      },
      (error) => {
        console.error(
          "❌ Erreur lors du chargement du PDF :",
          error.message,
          error
        );
      }
    );
  }, [file, pdfjsLib]);

  useEffect(() => {
    if (pdfDocument) {
      renderPage(pdfDocument, pageNumber);
    }
  }, [pageNumber, pdfDocument, renderPage]);

  const goToPrevPage = () => {
    if (pageNumber > 1 && !isRendering) {
      setPageNumber((prevPage) => prevPage - 1);
    }
  };

  const goToNextPage = () => {
    if (pageNumber < numPages && !isRendering) {
      setPageNumber((prevPage) => prevPage + 1);
    }
  };

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "auto" }}
      ></canvas>
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <button
          onClick={goToPrevPage}
          disabled={pageNumber <= 1 || isRendering}
        >
          Précédente
        </button>
        <button
          onClick={goToNextPage}
          disabled={pageNumber >= numPages || isRendering}
        >
          Suivante
        </button>
        <p>
          Page {pageNumber} sur {numPages}
        </p>
      </div>
    </div>
  );
}
