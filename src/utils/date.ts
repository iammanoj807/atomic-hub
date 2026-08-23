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

/**
 * The current London time as HH:MM, whatever timezone the device is in.
 * Used to work out which slot of the day is running right now, so it has to
 * agree with getLondonDateString rather than with the phone's clock.
 */
export const getLondonTimeString = (): string => {
    return new Date().toLocaleTimeString('en-GB', {
        timeZone: 'Europe/London',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
    });
};
