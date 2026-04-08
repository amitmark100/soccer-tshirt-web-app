const AUTH_USER_COOKIE = 'authUser';
const AUTH_CHANGE_EVENT = 'authchange';

export const getCookie = (name: string) => {
  const cookieEntry = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));

  if (!cookieEntry) {
    return null;
  }

  return decodeURIComponent(cookieEntry.split('=').slice(1).join('='));
};

export const hasAuthCookies = () => {
  return Boolean(getCookie(AUTH_USER_COOKIE));
};

export const broadcastAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const clearAuthCookies = () => {
  document.cookie = `${AUTH_USER_COOKIE}=; path=/; max-age=0; samesite=lax`;
  broadcastAuthChange();
};

export const authChangeEventName = AUTH_CHANGE_EVENT;
