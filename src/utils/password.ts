import bcrypt from "bcryptjs";

function getSaltRounds() {
  const raw =
    process.env.BCRYPT_SALT_ROUNDS ||
    process.env.PASSWORD_SALT_ROUNDS ||
    "10";
  const rounds = Number(raw);
  return Number.isNaN(rounds) ? 10 : rounds;
}

export async function hashPassword(value: string) {
  const rounds = getSaltRounds();
  return bcrypt.hash(value, rounds);
}

export async function comparePassword(value: string, hash: string) {
  return bcrypt.compare(value, hash);
}
