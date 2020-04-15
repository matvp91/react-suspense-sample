import React from "react";

const ResourceState = {
  Pending: "pending",
  Cached: "cached",
  Failed: "failed",
};

const ResourceTypeSymbol = Symbol("resource");

export default function createResource(promiseFn) {
  const defaultKeySymbol = Symbol("resource.default_key");

  // This would keep references in our map for the entire lifecycle of our app.
  // TODO: LRU cache or something similar?
  const cache = new Map();

  function load(key) {
    const promise = promiseFn(key);

    const cacheEntry = {
      state: ResourceState.Pending,
      value: null,
      promise,
    };
    cache.set(key, cacheEntry);

    promise
      .then((value) => {
        cacheEntry.state = ResourceState.Cached;
        cacheEntry.value = value;
      })
      .catch((error) => {
        cacheEntry.state = ResourceState.Failed;
        cacheEntry.value = error;
      });

    return cacheEntry;
  }

  function read(key = defaultKeySymbol) {
    const {
      ReactCurrentDispatcher,
    } = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    if (!ReactCurrentDispatcher.current) {
      throw new Error(
        "resource.read() has been called outside of a React render."
      );
    }

    if (!cache.has(key)) {
      throw load(key);
    }

    const { state, value, promise } = cache.get(key);

    if (state === ResourceState.Cached) {
      return value;
    } else if (state === ResourceState.Failed) {
      throw value;
    }

    throw promise;
  }

  function preload(key = defaultKeySymbol) {
    if (
      // We've got a result in our cache
      cache.has(key) &&
      // And the resource is pending or has a value
      cache.get(key).state !== ResourceState.Failed
    ) {
      return;
    }
    load(key);
  }

  return {
    $$type: ResourceTypeSymbol,
    read,
    preload,
  };
}

export function preloadResources(potentialResources) {
  return () => {
    const resources = potentialResources.filter(
      (it) => it.$$type === ResourceTypeSymbol
    );

    if (
      resources.length !== potentialResources.length
    ) {
      console.warn(
        "Not all given resources are valid, have they been created with createResource()?",
        { resources: potentialResources }
      );
    }

    resources.forEach((resource) => resource.preload());
  };
}
