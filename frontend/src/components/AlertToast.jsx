import React, { useState } from "react";
import "./AlertToast.css"

const ToastComponent = ({ message,showToast,type }) => {

  return (
    <div
      className={`toast position-fixed bottom-0 end-0 text-bg-${type} text-light fw-semibold border-0 m-3 mb-5 ${showToast ? 'show' : ''}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="d-flex px-1">
        <div className="toast-body mx-1 wrap">{message}</div>
        <button
          type="button"
          className="btn-close btn-close-white me-2 m-auto"
          data-bs-dismiss="toast"
          aria-label="Close"
        ></button>
      </div>
    </div>
  );
};

export default ToastComponent;
