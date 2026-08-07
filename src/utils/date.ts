// Date helpers shared across features.
// Everything in this app is keyed by a London calendar day, not by UTC —
// after 11pm BST those are different days, which would silently file an
// entry under tomorrow.

/**
 * Today's date as YYYY-MM-DD in London, whatever timezone the device is in.
 * 'en-CA' is used because it is the locale that formats as YYYY-MM-DD.
 */
export const getLondonDateString = (): string => {
    return new Date().toLocaleDateString('en-CA', {
        timeZone: 'Europe/London'
    });
};
