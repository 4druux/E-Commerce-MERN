// src/utils/formatPrice.js

export const formatPrice = (value) => {
    if (typeof value !== 'string' && typeof value !== 'number') {
      return '';
    }
  
    const stringValue = value.toString().replace(/\D/g, ''); // Menghilangkan karakter non-digit
    return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  
  export const unformatPrice = (formattedValue) => {
    if (typeof formattedValue !== 'string') {
      return 0;
    }
  
    return parseInt(formattedValue.replace(/\./g, ''), 10);
  };
  
  