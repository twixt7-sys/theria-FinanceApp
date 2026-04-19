const EMAIL_MAX = 254;
const USERNAME_MIN = 2;
const USERNAME_MAX = 48;
/** Demo-friendly floor; tighten when wiring a real API. */
const PASSWORD_MIN = 4;
const PASSWORD_MAX = 128;

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/** Display-style handle: letters, numbers, spaces, common punctuation (no control chars). */
const USERNAME_RE = /^[a-zA-Z0-9\s._-]+$/;

export type AuthMode = 'login' | 'register';

export function validateEmail(email: string): string | null {
  const t = email.trim();
  if (!t) return 'Enter your email address.';
  if (t.length > EMAIL_MAX) return 'That email looks too long.';
  if (!EMAIL_RE.test(t)) return 'Enter a valid email address.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN) {
    return `Password must be at least ${PASSWORD_MIN} characters.`;
  }
  if (password.length > PASSWORD_MAX) {
    return `Password must be at most ${PASSWORD_MAX} characters.`;
  }
  return null;
}

export function validateUsername(username: string): string | null {
  const t = username.trim();
  if (t.length < USERNAME_MIN) {
    return `Username must be at least ${USERNAME_MIN} characters.`;
  }
  if (t.length > USERNAME_MAX) {
    return `Username must be at most ${USERNAME_MAX} characters.`;
  }
  if (!USERNAME_RE.test(t)) {
    return 'Username may only include letters, numbers, spaces, dots, underscores, and hyphens.';
  }
  return null;
}

export function validateAuthForm(
  mode: AuthMode,
  fields: { email: string; password: string; username: string },
): string | null {
  const emailErr = validateEmail(fields.email);
  if (emailErr) return emailErr;

  const passErr = validatePassword(fields.password);
  if (passErr) return passErr;

  if (mode === 'register') {
    const userErr = validateUsername(fields.username);
    if (userErr) return userErr;
  }

  return null;
}
