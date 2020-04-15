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

  function parsePayload(payload = {}) {
    if (typeof payload === "string") {
      console.warn(
        "Using a string type as key in resource.load(key) is not adviced. Use resource.load({ key: 'identifier' }) instead."
      );
      return {
        key: payload,
      };
    }

    if (typeof payload !== "object") {
      throw new Error(
        "Using a non object key in resource.load(key) is not allowed."
      );
    }

    if (!payload.key) {
      payload.key = defaultKeySymbol;
    }

    return payload;
  }

  function load(payload) {
    const { key, ...promisePayload } = payload;
    const promise = promiseFn(promisePayload);

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

  function read(input) {
    const payload = parsePayload(input);

    const {
      ReactCurrentDispatcher,
    } = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    if (!ReactCurrentDispatcher.current) {
      throw new Error(
        "resource.read() has been called outside of a React render."
      );
    }

    if (!cache.has(payload.key)) {
      throw load(payload);
    }

    const { state, value, promise } = cache.get(payload.key);

    if (state === ResourceState.Cached) {
      return value;
    } else if (state === ResourceState.Failed) {
      throw value;
    }

    throw promise;
  }

  function preload(input) {
    const payload = parsePayload(input);

    if (
      // We've got a result in our cache
      cache.has(payload.key) &&
      // And the resource is pending or has a value
      cache.get(payload.key).state !== ResourceState.Failed
    ) {
      return;
    }
    load(payload);
  }

  function clear(input) {
    const { key } = parsePayload(input);
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
