import React from "react";
import PropTypes from "prop-types"; 
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const SweetAlert = ({ title, message, icon }) => {
  return new Promise((resolve) => {
    if (title && message && icon) {
      MySwal.fire({
        title: `<span class="custom-title">${title}</span>`,
        html: `<p>${message}</p>`,
        icon: icon,
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "custom-confirm-button",
          popup: "custom-popup",
          backdrop: "custom-backdrop",
        },
        allowOutsideClick: true,
      }).then((result) => {
        if (result.isConfirmed) {
          resolve(true); 
        } else {
          resolve(false); 
        }
      });
    } else {
      resolve(false); 
    }
  });
};

SweetAlert.propTypes = {
  title: PropTypes.string.isRequired, 
  message: PropTypes.string.isRequired, 
  icon: PropTypes.oneOf(["success", "error", "warning", "info", "question"]).isRequired, 
};

export default SweetAlert;
