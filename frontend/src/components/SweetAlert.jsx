import React from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const SweetAlert = ({ title, message, icon }) => {
  return new Promise((resolve) => {
    if (title && message && icon) {
      MySwal.fire({
        title: `<span class="elegant-title">${title}</span>`,
        html: `<p class="elegant-message">${message}</p>`,
        icon: icon,
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "elegant-confirm-button",
          popup: "elegant-popup",
        },
        backdrop: true,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
        allowOutsideClick: true,
        width: "450px",
      }).then((result) => {
        resolve(result.isConfirmed);
      });
    } else {
      resolve(false);
    }
  });
};

SweetAlert.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  icon: PropTypes.oneOf(["success", "error", "warning", "info", "question"])
    .isRequired,
};

export default SweetAlert;
