const bcrypt = require('bcryptjs');

const hash = '$2b$10$k37f7OUQwdrfb1qc1B0KZuY1ll2hV9mEW5ROMhbbhok/t5fRtiake';
const password = 'Amatal2024!';

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Match:', result);
});
