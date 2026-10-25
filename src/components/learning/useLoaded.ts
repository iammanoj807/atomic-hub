import { useEffect, useState } from 'react';

// Content too big for the main bundle (a study page's animations, its practice
// answers) comes as its own chunk, loaded the first time a topic is opened.

type Loader<T> = () => Promise<T>;

/** Everything already loaded, so a topic opened a second time has it at once. */
const loaded = new Map<Loader<unknown>, unknown>();

/**
 * What `load` gives, or null until it arrives. Nothing loads until `when` is true.
 * `load` must be the same function on every render (define it at module level).
 */
export const useLoaded = <T>(load: Loader<T>, when = true): T | null => {
    const [value, setValue] = useState<T | null>(() => (loaded.get(load) as T | undefined) ?? null);

    useEffect(() => {
        if (value !== null || !when) return;
        let live = true;
        load()
            .then(result => {
                loaded.set(load, result);
                if (live) setValue(result);
            })
            .catch(error => console.error('Failed to load:', error));
        return () => {
            live = false;
        };
    }, [load, value, when]);

    return value;
};
