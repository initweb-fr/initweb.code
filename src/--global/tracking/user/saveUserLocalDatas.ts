import { getCookie, setCookie } from '$utils/--global/cookieUtilities';
import {
  STORAGE_KEY_USER_PREFIX,
  STORAGE_KEY_USER_FIRSTNAME,
  STORAGE_KEY_USER_LASTNAME,
  STORAGE_KEY_USER_FULLNAME,
} from '$global/storageKeys';

export function saveUserLocalDatas() {
  document.querySelectorAll('input[iw-formdata]').forEach((input) => {
    input.addEventListener('blur', () => {
      const attr = input.getAttribute('iw-formdata');
      // Si l'attribu n'existe pas ou ne contient pas "user_", on ne fait rien et on sort de la fonction
      if (!attr || !attr.includes('user_')) return;

      const inputElement = input as HTMLInputElement;
      setCookie(STORAGE_KEY_USER_PREFIX + attr, inputElement.value);

      if (attr === 'firstName' || attr === 'lastName') {
        const firstName =
          attr === 'firstName' ? inputElement.value : getCookie(STORAGE_KEY_USER_FIRSTNAME) || '';
        const lastName =
          attr === 'lastName' ? inputElement.value : getCookie(STORAGE_KEY_USER_LASTNAME) || '';
        setCookie(STORAGE_KEY_USER_FULLNAME, (firstName + ' ' + lastName).trim());
      }
    });
  });
}
