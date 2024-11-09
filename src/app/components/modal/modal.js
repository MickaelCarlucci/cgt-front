import "./modal.css"; // Ajoute des styles pour la modal

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  // Fonction pour gérer le clic à l'extérieur de la modal
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button onClick={onClose} className="modal-close">
            X
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
