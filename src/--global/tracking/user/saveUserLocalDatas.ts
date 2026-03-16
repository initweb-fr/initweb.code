import {
  STORAGE_KEY_USER_FIRSTNAME,
  STORAGE_KEY_USER_FULLNAME,
  STORAGE_KEY_USER_LASTNAME,
  STORAGE_KEY_USER_PREFIX,
} from '$global/storageKeys';
import { getCookie, setCookie } from '$global/utils/cookieUtilities';

export function saveUserLocalDatas() {
  document.querySelectorAll('input[iw-formdata]').forEach((input) => {
    input.addEventListener('blur', () => {
      const attr = input.getAttribute('iw-formdata');
      if (!attr || !attr.includes('user_')) return;

      const inputElement = input as HTMLInputElement;
      setCookie(STORAGE_KEY_USER_PREFIX + attr, inputElement.value);

      if (attr === 'user_firstname' || attr === 'user_lastname') {
        const firstName =
          attr === 'user_firstname' ? inputElement.value : getCookie(STORAGE_KEY_USER_FIRSTNAME) || '';
        const lastName =
          attr === 'user_lastname' ? inputElement.value : getCookie(STORAGE_KEY_USER_LASTNAME) || '';
        setCookie(STORAGE_KEY_USER_FULLNAME, (firstName + ' ' + lastName).trim());
      }
    });
  });
}
