/**
 * Cookie domain partagé entre initweb.fr et aca.initweb.fr.
 * Le point initial est obligatoire pour couvrir tous les sous-domaines.
 */
export const COOKIE_DOMAIN = '.initweb.fr';

export type CookieOptions = {
  domain?: string;
  path?: string;
  maxAgeDays?: number;
  sameSite?: 'Lax' | 'Strict' | 'None';
  secure?: boolean;
};

export function getCookie(name: string): string | null {
  const prefix = name + '=';
  const parts = document.cookie.split('; ');
  for (let i = 0; i < parts.length; i++) {
    const row = parts[i];
    if (row.indexOf(prefix) === 0) return decodeURIComponent(row.slice(prefix.length)) ?? null;
  }
  return null;
}

export function setCookie(name: string, value: string, options?: CookieOptions) {
  let cookie = `${name}=${encodeURIComponent(value)}`;

  cookie += `; path=${options?.path ?? '/'}`;

  if (options?.domain) cookie += `; domain=${options.domain}`;

  if (options?.maxAgeDays !== undefined) {
    const expires = new Date();
    expires.setDate(expires.getDate() + options.maxAgeDays);
    cookie += `; expires=${expires.toUTCString()}`;
  }

  cookie += `; SameSite=${options?.sameSite ?? 'Lax'}`;

  if (options?.secure) cookie += `; Secure`;

  document.cookie = cookie;
}

export function deleteCookie(name: string, domain?: string) {
  document.cookie = `${name}=; path=/; ${domain ? `domain=${domain}; ` : ''}expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}
