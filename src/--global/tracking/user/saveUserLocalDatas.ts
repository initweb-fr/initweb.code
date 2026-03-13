import { COOKIE_KEY_USER, type UserCookie } from '$global/storageKeys';
import { getJsonCookie, setJsonCookie } from '$global/utils/cookieUtilities';

export function saveUserLocalDatas() {
  document.querySelectorAll('input[iw-formdata]').forEach((input) => {
    input.addEventListener('blur', () => {
      const attr = input.getAttribute('iw-formdata');
      if (!attr || !attr.includes('user_')) return;

      const inputElement = input as HTMLInputElement;
      const current = getJsonCookie<UserCookie>(COOKIE_KEY_USER) as UserCookie;

      const updated: UserCookie = { ...current, [attr]: inputElement.value };

      // Recalcul du fullname si prénom ou nom change
      if (attr === 'user_firstname' || attr === 'user_lastname') {
        const firstName =
          attr === 'user_firstname' ? inputElement.value : (current['user_firstname'] ?? '');
        const lastName =
          attr === 'user_lastname' ? inputElement.value : (current['user_lastname'] ?? '');
        updated['user_fullname'] = (firstName + ' ' + lastName).trim();
      }

      setJsonCookie<UserCookie>(COOKIE_KEY_USER, updated);
    });
  });
}
