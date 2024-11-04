import React from "react";
import PropTypes from "prop-types"; // Import prop-types untuk validasi props
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const SweetAlert = ({ title, message, icon }) => {
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
      allowOutsideClick: false,
    });
  }

  return null; // Jangan render apapun jika kondisi tidak terpenuhi
};

// Menambahkan validasi tipe props menggunakan prop-types
SweetAlert.propTypes = {
  title: PropTypes.string.isRequired, // title harus berupa string dan wajib
  message: PropTypes.string.isRequired, // message harus berupa string dan wajib
  icon: PropTypes.oneOf(["success", "error", "warning", "info", "question"]).isRequired, // icon harus berupa salah satu dari pilihan yang ada
};

export default SweetAlert;


