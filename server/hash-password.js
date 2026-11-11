// Gebruik: npm run hash-password -- <wachtwoord>
import { hashPassword } from './auth.js';

const password = process.argv[2];
if (!password) {
  console.error('Gebruik: npm run hash-password -- <wachtwoord>');
  process.exit(1);
}
console.log(hashPassword(password));
