import { getCookie } from '../../utils/cookieUtilities';
import { STORAGE_KEY_USER_PREFIX } from '$global/storageKeys';

export function fillUserLocalDatas() {
  document.querySelectorAll('input[iw-formdata]').forEach((input) => {
    const attr = input.getAttribute('iw-formdata');
    if (!attr) return;
    const val = getCookie(STORAGE_KEY_USER_PREFIX + attr);
    const inputElement = input as HTMLInputElement;
    if (val) inputElement.value = val;
    // Si l'attribut contient "URL", on décode la valeur pour avoir l'URL en clair
    if (attr.includes('URL') && val) {
      inputElement.value = decodeURIComponent(val);
    }
  });
}
