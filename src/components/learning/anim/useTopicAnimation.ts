import { useEffect, useMemo, useState } from 'react';
import type { AnimationSpec } from './scene';

// The animations for a study page, loaded the first time a topic is opened.
// System Design, SQL and DSA are in the main bundle, so their animations come
// as a separate chunk instead of making every page slower to open.

/** One animation per topic id. Each is a function, so its frames are only worked out when the topic is opened. */
export type AnimationRegistry = Record<string, () => AnimationSpec>;

export type AnimationLoader = () => Promise<AnimationRegistry>;

/** Registries already loaded, so a topic opened a second time shows its animation at once. */
const loaded = new Map<AnimationLoader, AnimationRegistry>();

/**
 * The topic's animation, or null while it loads or if the topic has none.
 * `load` must be the same function on every render (define it at module level).
 */
export const useTopicAnimation = (load: AnimationLoader, topicId: string): AnimationSpec | null => {
    const [registry, setRegistry] = useState<AnimationRegistry | null>(() => loaded.get(load) ?? null);

    useEffect(() => {
        if (registry) return;
        let live = true;
        load()
            .then(result => {
                loaded.set(load, result);
                if (live) setRegistry(result);
            })
            .catch(error => console.error('Failed to load animations:', error));
        return () => {
            live = false;
        };
    }, [load, registry]);

    return useMemo(() => registry?.[topicId]?.() ?? null, [registry, topicId]);
};
