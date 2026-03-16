import { STORAGE_KEY_USER_PREFIX } from '$global/storageKeys';
import { getCookie } from '$global/utils/cookieUtilities';

export function fillUserLocalDatas() {
  document.querySelectorAll('input[iw-formdata]').forEach((input) => {
    const attr = input.getAttribute('iw-formdata');
    if (!attr) return;

    const val = getCookie(STORAGE_KEY_USER_PREFIX + attr);
    if (val) (input as HTMLInputElement).value = val;
  });
}
