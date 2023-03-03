function parseUserAgent(ua: string) {
  return ua.split(",").filter(value => value !== "").join(" | ");
}

function share(title: string, text: string, url: string): Promise<boolean> {
  return new Promise(resolve => {
    if (navigator.share) {
      navigator.share({ title, text, url })
        .then(() => resolve(true))
        .catch(() => resolve(false))
    } else {
      resolve(false);
    }
  })
}

function copyToClipboard(text: string): Promise<boolean> {
  return new Promise(resolve => {
    navigator.clipboard.writeText(text)
      .then(() => resolve(true))
      .catch(() => resolve(false))
  })
}

/**
 * Tries to change object properties of a with the ones from b.
 * Used in user store's setUsers & setNotifications functions.
 * The reason why is as follows:
 * There was a bug regarding user.hasNotification, when the user
 * first loads the application, /api "auth" request gets this property,
 * but when a /api "getGuestFeed" request is made, both discussions and
 * users are fetched. Those users that are fetched, don't have the
 * user.hasNotification property, which is overridden when userStore.setUsers
 * is called. Which in turn makes user see a flash of notification indicator.
 * So this function must be used when making changes to objects in stores.
 * TODO: Use this function in all stores, currently only used in user store.
 * @param a 
 * @param b 
 * @returns 
 */
function tryObjSwap<
  TA extends Object, TB extends Object
>(a: TA | undefined, b: TB) {
  if (!a) return b;

  for (const prop in a) {
    if (a.hasOwnProperty(prop) && b.hasOwnProperty(prop)) {
      // @ts-ignore
      a[prop] = b[prop];
    }
  }

  return a;
}

function compareId(a: string, b: string, reverse?: boolean) {
  if (a.length > b.length) b = "0".repeat(a.length - b.length) + b;
  else if (a.length < b.length) a = "0".repeat(b.length - a.length) + a;

  if (a < b) return !reverse ? -1 : +1;
  if (a > b) return !reverse ? +1 : -1;
  return 0;
}

export const util = {
  parseUserAgent,
  share,
  copyToClipboard,
  tryObjSwap,
  compareId,
}