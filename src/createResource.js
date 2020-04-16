import React, { useMemo } from "react";

const ResourceState = {
  Pending: "pending",
  Cached: "cached",
  Failed: "failed",
};

const ResourceTypeSymbol = Symbol("resource");

export default function createResource(promiseFn) {
  const cache = new Map();

  const defaultKey = Symbol('resource.default_key');

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

  function read(key = defaultKey) {
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

  function preload(key = defaultKey) {
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

  function clear(key = defaultKey) {
    if (cache.has(key)) {
      cache.delete(key);
    }
  }

  return {
    $$type: ResourceTypeSymbol,
    read,
    preload,
    clear,
  };
}

export function preloadResources(potentialResources) {
  return () => {
    const resources = potentialResources.filter(
      (it) => it.$$type === ResourceTypeSymbol
    );

    if (resources.length !== potentialResources.length) {
      console.warn(
        "Not all given resources are valid, have they been created with createResource()?",
        { resources: potentialResources }
      );
    }

    resources.forEach((resource) => resource.preload());
  };
}

export function useResource(createResource, deps) {
  const memoized = useMemo(createResource, deps);

  return memoized;
}