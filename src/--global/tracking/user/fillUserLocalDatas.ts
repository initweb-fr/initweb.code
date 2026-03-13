import { COOKIE_KEY_USER, type UserCookie } from '$global/storageKeys';
import { getJsonCookie } from '$global/utils/cookieUtilities';

export function fillUserLocalDatas() {
  const user = getJsonCookie<UserCookie>(COOKIE_KEY_USER) as UserCookie;

  document.querySelectorAll('input[iw-formdata]').forEach((input) => {
    const attr = input.getAttribute('iw-formdata');
    if (!attr) return;

    const val = user[attr];
    if (val) (input as HTMLInputElement).value = val;
  });
}
