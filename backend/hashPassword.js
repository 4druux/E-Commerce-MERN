const bcrypt = require('bcryptjs'); // Import bcryptjs untuk hashing password

// Fungsi untuk hashing password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10); // Membuat salt untuk ditambahkan ke password
  const hashedPassword = await bcrypt.hash(password, salt); // Hash password
  return hashedPassword; // Kembalikan hasil password yang di-hash
};

// Masukkan password yang ingin kamu hash di sini
hashPassword('admin4drux505').then((hashedPassword) => {
  console.log('Hashed Password:', hashedPassword); // Tampilkan hasil hash
});
