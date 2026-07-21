import bcrypt from 'bcryptjs';
import { closePool, query } from '../config/database.js';

async function main() {
  if (process.env.BOOTSTRAP_ACKNOWLEDGEMENT !== 'create-initial-admin') {
    throw new Error('Refusing admin provisioning without BOOTSTRAP_ACKNOWLEDGEMENT=create-initial-admin');
  }
  const email = process.env.PROVISION_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.PROVISION_ADMIN_PASSWORD;
  const name = process.env.PROVISION_ADMIN_NAME?.trim() || 'Initial Administrator';
  if (!email || !password || password.length < 12) {
    throw new Error('PROVISION_ADMIN_EMAIL and a password of at least 12 characters are required');
  }
  const existing = await query('SELECT 1 FROM users WHERE lower(email)=lower($1)', [email]);
  if (existing.rowCount) throw new Error(`Refusing to overwrite existing account ${email}`);
  const split = name.lastIndexOf(' ');
  const firstName = split > 0 ? name.slice(0, split) : name;
  const lastName = split > 0 ? name.slice(split + 1) : 'Administrator';
  await query(
    `INSERT INTO users(email,password_hash,first_name,last_name,role,is_verified,is_active)
     VALUES($1,$2,$3,$4,'admin',TRUE,TRUE)`,
    [email, await bcrypt.hash(password, 12), firstName, lastName],
  );
  console.log(`Provisioned initial administrator ${email}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => closePool());
