/**
* (c) Iconify
*
* For the full copyright and license information, please view the license.txt
* files at https://github.com/iconify/iconify
*
* Licensed under MIT.
*
* @license MIT
* @version 2.3.0
*/
(function () {
  'use strict';

  const defaultIconDimensions = Object.freeze(
    {
      left: 0,
      top: 0,
      width: 16,
      height: 16
    }
  );
  const defaultIconTransformations = Object.freeze({
    rotate: 0,
    vFlip: false,
    hFlip: false
  });
  const defaultIconProps = Object.freeze({
    ...defaultIconDimensions,
    ...defaultIconTransformations
  });
  const defaultExtendedIconProps = Object.freeze({
    ...defaultIconProps,
    body: "",
    hidden: false
  });

  const defaultIconSizeCustomisations = Object.freeze({
    width: null,
    height: null
  });
  const defaultIconCustomisations = Object.freeze({
    // Dimensions
    ...defaultIconSizeCustomisations,
    // Transformations
    ...defaultIconTransformations
  });

  function rotateFromString(value, defaultValue = 0) {
    const units = value.replace(/^-?[0-9.]*/, "");
    function cleanup(value2) {
      while (value2 < 0) {
        value2 += 4;
      }
      return value2 % 4;
    }
    if (units === "") {
      const num = parseInt(value);
      return isNaN(num) ? 0 : cleanup(num);
    } else if (units !== value) {
      let split = 0;
      switch (units) {
        case "%":
          split = 25;
          break;
        case "deg":
          split = 90;
      }
      if (split) {
        let num = parseFloat(value.slice(0, value.length - units.length));
        if (isNaN(num)) {
          return 0;
        }
        num = num / split;
        return num % 1 === 0 ? cleanup(num) : 0;
      }
    }
    return defaultValue;
  }

  const separator = /[\s,]+/;
  function flipFromString(custom, flip) {
    flip.split(separator).forEach((str) => {
      const value = str.trim();
      switch (value) {
        case "horizontal":
          custom.hFlip = true;
          break;
        case "vertical":
          custom.vFlip = true;
          break;
      }
    });
  }

  const defaultCustomisations = {
      ...defaultIconCustomisations,
      preserveAspectRatio: '',
  };
  /**
   * Get customisations
   */
  function getCustomisations(node) {
      const customisations = {
          ...defaultCustomisations,
      };
      const attr = (key, def) => node.getAttribute(key) || def;
      // Dimensions
      customisations.width = attr('width', null);
      customisations.height = attr('height', null);
      // Rotation
      customisations.rotate = rotateFromString(attr('rotate', ''));
      // Flip
      flipFromString(customisations, attr('flip', ''));
      // SVG attributes
      customisations.preserveAspectRatio = attr('preserveAspectRatio', attr('preserveaspectratio', ''));
      return customisations;
  }
  /**
   * Check if customisations have been updated
   */
  function haveCustomisationsChanged(value1, value2) {
      for (const key in defaultCustomisations) {
          if (value1[key] !== value2[key]) {
              return true;
          }
      }
      return false;
  }

  const matchIconName = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  const stringToIcon = (value, validate, allowSimpleName, provider = "") => {
    const colonSeparated = value.split(":");
    if (value.slice(0, 1) === "@") {
      if (colonSeparated.length < 2 || colonSeparated.length > 3) {
        return null;
      }
      provider = colonSeparated.shift().slice(1);
    }
    if (colonSeparated.length > 3 || !colonSeparated.length) {
      return null;
    }
    if (colonSeparated.length > 1) {
      const name2 = colonSeparated.pop();
      const prefix = colonSeparated.pop();
      const result = {
        // Allow provider without '@': "provider:prefix:name"
        provider: colonSeparated.length > 0 ? colonSeparated[0] : provider,
        prefix,
        name: name2
      };
      return validate && !validateIconName(result) ? null : result;
    }
    const name = colonSeparated[0];
    const dashSeparated = name.split("-");
    if (dashSeparated.length > 1) {
      const result = {
        provider,
        prefix: dashSeparated.shift(),
        name: dashSeparated.join("-")
      };
      return validate && !validateIconName(result) ? null : result;
    }
    if (allowSimpleName && provider === "") {
      const result = {
        provider,
        prefix: "",
        name
      };
      return validate && !validateIconName(result, allowSimpleName) ? null : result;
    }
    return null;
  };
  const validateIconName = (icon, allowSimpleName) => {
    if (!icon) {
      return false;
    }
    return !!// Check prefix: cannot be empty, unless allowSimpleName is enabled
    // Check name: cannot be empty
    ((allowSimpleName && icon.prefix === "" || !!icon.prefix) && !!icon.name);
  };

  function mergeIconTransformations(obj1, obj2) {
    const result = {};
    if (!obj1.hFlip !== !obj2.hFlip) {
      result.hFlip = true;
    }
    if (!obj1.vFlip !== !obj2.vFlip) {
      result.vFlip = true;
    }
    const rotate = ((obj1.rotate || 0) + (obj2.rotate || 0)) % 4;
    if (rotate) {
      result.rotate = rotate;
    }
    return result;
  }

  function mergeIconData(parent, child) {
    const result = mergeIconTransformations(parent, child);
    for (const key in defaultExtendedIconProps) {
      if (key in defaultIconTransformations) {
        if (key in parent && !(key in result)) {
          result[key] = defaultIconTransformations[key];
        }
      } else if (key in child) {
        result[key] = child[key];
      } else if (key in parent) {
        result[key] = parent[key];
      }
    }
    return result;
  }

  function getIconsTree(data, names) {
    const icons = data.icons;
    const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
    const resolved = /* @__PURE__ */ Object.create(null);
    function resolve(name) {
      if (icons[name]) {
        return resolved[name] = [];
      }
      if (!(name in resolved)) {
        resolved[name] = null;
        const parent = aliases[name] && aliases[name].parent;
        const value = parent && resolve(parent);
        if (value) {
          resolved[name] = [parent].concat(value);
        }
      }
      return resolved[name];
    }
    (Object.keys(icons).concat(Object.keys(aliases))).forEach(resolve);
    return resolved;
  }

  function internalGetIconData(data, name, tree) {
    const icons = data.icons;
    const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
    let currentProps = {};
    function parse(name2) {
      currentProps = mergeIconData(
        icons[name2] || aliases[name2],
        currentProps
      );
    }
    parse(name);
    tree.forEach(parse);
    return mergeIconData(data, currentProps);
  }

  function parseIconSet(data, callback) {
    const names = [];
    if (typeof data !== "object" || typeof data.icons !== "object") {
      return names;
    }
    if (data.not_found instanceof Array) {
      data.not_found.forEach((name) => {
        callback(name, null);
        names.push(name);
      });
    }
    const tree = getIconsTree(data);
    for (const name in tree) {
      const item = tree[name];
      if (item) {
        callback(name, internalGetIconData(data, name, item));
        names.push(name);
      }
    }
    return names;
  }

  const optionalPropertyDefaults = {
    provider: "",
    aliases: {},
    not_found: {},
    ...defaultIconDimensions
  };
  function checkOptionalProps(item, defaults) {
    for (const prop in defaults) {
      if (prop in item && typeof item[prop] !== typeof defaults[prop]) {
        return false;
      }
    }
    return true;
  }
  function quicklyValidateIconSet(obj) {
    if (typeof obj !== "object" || obj === null) {
      return null;
    }
    const data = obj;
    if (typeof data.prefix !== "string" || !obj.icons || typeof obj.icons !== "object") {
      return null;
    }
    if (!checkOptionalProps(obj, optionalPropertyDefaults)) {
      return null;
    }
    const icons = data.icons;
    for (const name in icons) {
      const icon = icons[name];
      if (
        // Name cannot be empty
        !name || // Must have body
        typeof icon.body !== "string" || // Check other props
        !checkOptionalProps(
          icon,
          defaultExtendedIconProps
        )
      ) {
        return null;
      }
    }
    const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
    for (const name in aliases) {
      const icon = aliases[name];
      const parent = icon.parent;
      if (
        // Name cannot be empty
        !name || // Parent must be set and point to existing icon
        typeof parent !== "string" || !icons[parent] && !aliases[parent] || // Check other props
        !checkOptionalProps(
          icon,
          defaultExtendedIconProps
        )
      ) {
        return null;
      }
    }
    return data;
  }

  const dataStorage = /* @__PURE__ */ Object.create(null);
  function newStorage(provider, prefix) {
    return {
      provider,
      prefix,
      icons: /* @__PURE__ */ Object.create(null),
      missing: /* @__PURE__ */ new Set()
    };
  }
  function getStorage(provider, prefix) {
    const providerStorage = dataStorage[provider] || (dataStorage[provider] = /* @__PURE__ */ Object.create(null));
    return providerStorage[prefix] || (providerStorage[prefix] = newStorage(provider, prefix));
  }
  function addIconSet(storage, data) {
    if (!quicklyValidateIconSet(data)) {
      return [];
    }
    return parseIconSet(data, (name, icon) => {
      if (icon) {
        storage.icons[name] = icon;
      } else {
        storage.missing.add(name);
      }
    });
  }
  function addIconToStorage(storage, name, icon) {
    try {
      if (typeof icon.body === "string") {
        storage.icons[name] = { ...icon };
        return true;
      }
    } catch (err) {
    }
    return false;
  }
  function listIcons(provider, prefix) {
    let allIcons = [];
    const providers = typeof provider === "string" ? [provider] : Object.keys(dataStorage);
    providers.forEach((provider2) => {
      const prefixes = typeof provider2 === "string" && typeof prefix === "string" ? [prefix] : Object.keys(dataStorage[provider2] || {});
      prefixes.forEach((prefix2) => {
        const storage = getStorage(provider2, prefix2);
        allIcons = allIcons.concat(
          Object.keys(storage.icons).map(
            (name) => (provider2 !== "" ? "@" + provider2 + ":" : "") + prefix2 + ":" + name
          )
        );
      });
    });
    return allIcons;
  }

  let simpleNames = false;
  function allowSimpleNames(allow) {
    if (typeof allow === "boolean") {
      simpleNames = allow;
    }
    return simpleNames;
  }
  function getIconData(name) {
    const icon = typeof name === "string" ? stringToIcon(name, true, simpleNames) : name;
    if (icon) {
      const storage = getStorage(icon.provider, icon.prefix);
      const iconName = icon.name;
      return storage.icons[iconName] || (storage.missing.has(iconName) ? null : void 0);
    }
  }
  function addIcon(name, data) {
    const icon = stringToIcon(name, true, simpleNames);
    if (!icon) {
      return false;
    }
    const storage = getStorage(icon.provider, icon.prefix);
    if (data) {
      return addIconToStorage(storage, icon.name, data);
    } else {
      storage.missing.add(icon.name);
      return true;
    }
  }
  function addCollection(data, provider) {
    if (typeof data !== "object") {
      return false;
    }
    if (typeof provider !== "string") {
      provider = data.provider || "";
    }
    if (simpleNames && !provider && !data.prefix) {
      let added = false;
      if (quicklyValidateIconSet(data)) {
        data.prefix = "";
        parseIconSet(data, (name, icon) => {
          if (addIcon(name, icon)) {
            added = true;
          }
        });
      }
      return added;
    }
    const prefix = data.prefix;
    if (!validateIconName({
      provider,
      prefix,
      name: "a"
    })) {
      return false;
    }
    const storage = getStorage(provider, prefix);
    return !!addIconSet(storage, data);
  }
  function iconLoaded(name) {
    return !!getIconData(name);
  }
  function getIcon(name) {
    const result = getIconData(name);
    return result ? {
      ...defaultIconProps,
      ...result
    } : result;
  }

  function sortIcons(icons) {
    const result = {
      loaded: [],
      missing: [],
      pending: []
    };
    const storage = /* @__PURE__ */ Object.create(null);
    icons.sort((a, b) => {
      if (a.provider !== b.provider) {
        return a.provider.localeCompare(b.provider);
      }
      if (a.prefix !== b.prefix) {
        return a.prefix.localeCompare(b.prefix);
      }
      return a.name.localeCompare(b.name);
    });
    let lastIcon = {
      provider: "",
      prefix: "",
      name: ""
    };
    icons.forEach((icon) => {
      if (lastIcon.name === icon.name && lastIcon.prefix === icon.prefix && lastIcon.provider === icon.provider) {
        return;
      }
      lastIcon = icon;
      const provider = icon.provider;
      const prefix = icon.prefix;
      const name = icon.name;
      const providerStorage = storage[provider] || (storage[provider] = /* @__PURE__ */ Object.create(null));
      const localStorage = providerStorage[prefix] || (providerStorage[prefix] = getStorage(provider, prefix));
      let list;
      if (name in localStorage.icons) {
        list = result.loaded;
      } else if (prefix === "" || localStorage.missing.has(name)) {
        list = result.missing;
      } else {
        list = result.pending;
      }
      const item = {
        provider,
        prefix,
        name
      };
      list.push(item);
    });
    return result;
  }

  function removeCallback(storages, id) {
    storages.forEach((storage) => {
      const items = storage.loaderCallbacks;
      if (items) {
        storage.loaderCallbacks = items.filter((row) => row.id !== id);
      }
    });
  }
  function updateCallbacks(storage) {
    if (!storage.pendingCallbacksFlag) {
      storage.pendingCallbacksFlag = true;
      setTimeout(() => {
        storage.pendingCallbacksFlag = false;
        const items = storage.loaderCallbacks ? storage.loaderCallbacks.slice(0) : [];
        if (!items.length) {
          return;
        }
        let hasPending = false;
        const provider = storage.provider;
        const prefix = storage.prefix;
        items.forEach((item) => {
          const icons = item.icons;
          const oldLength = icons.pending.length;
          icons.pending = icons.pending.filter((icon) => {
            if (icon.prefix !== prefix) {
              return true;
            }
            const name = icon.name;
            if (storage.icons[name]) {
              icons.loaded.push({
                provider,
                prefix,
                name
              });
            } else if (storage.missing.has(name)) {
              icons.missing.push({
                provider,
                prefix,
                name
              });
            } else {
              hasPending = true;
              return true;
            }
            return false;
          });
          if (icons.pending.length !== oldLength) {
            if (!hasPending) {
              removeCallback([storage], item.id);
            }
            item.callback(
              icons.loaded.slice(0),
              icons.missing.slice(0),
              icons.pending.slice(0),
              item.abort
            );
          }
        });
      });
    }
  }
  let idCounter = 0;
  function storeCallback(callback, icons, pendingSources) {
    const id = idCounter++;
    const abort = removeCallback.bind(null, pendingSources, id);
    if (!icons.pending.length) {
      return abort;
    }
    const item = {
      id,
      icons,
      callback,
      abort
    };
    pendingSources.forEach((storage) => {
      (storage.loaderCallbacks || (storage.loaderCallbacks = [])).push(item);
    });
    return abort;
  }

  const storage = /* @__PURE__ */ Object.create(null);
  function setAPIModule(provider, item) {
    storage[provider] = item;
  }
  function getAPIModule(provider) {
    return storage[provider] || storage[""];
  }

  function listToIcons(list, validate = true, simpleNames = false) {
    const result = [];
    list.forEach((item) => {
      const icon = typeof item === "string" ? stringToIcon(item, validate, simpleNames) : item;
      if (icon) {
        result.push(icon);
      }
    });
    return result;
  }

  // src/config.ts
  var defaultConfig = {
    resources: [],
    index: 0,
    timeout: 2e3,
    rotate: 750,
    random: false,
    dataAfterTimeout: false
  };

  // src/query.ts
  function sendQuery(config, payload, query, done) {
    const resourcesCount = config.resources.length;
    const startIndex = config.random ? Math.floor(Math.random() * resourcesCount) : config.index;
    let resources;
    if (config.random) {
      let list = config.resources.slice(0);
      resources = [];
      while (list.length > 1) {
        const nextIndex = Math.floor(Math.random() * list.length);
        resources.push(list[nextIndex]);
        list = list.slice(0, nextIndex).concat(list.slice(nextIndex + 1));
      }
      resources = resources.concat(list);
    } else {
      resources = config.resources.slice(startIndex).concat(config.resources.slice(0, startIndex));
    }
    const startTime = Date.now();
    let status = "pending";
    let queriesSent = 0;
    let lastError;
    let timer = null;
    let queue = [];
    let doneCallbacks = [];
    if (typeof done === "function") {
      doneCallbacks.push(done);
    }
    function resetTimer() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }
    function abort() {
      if (status === "pending") {
        status = "aborted";
      }
      resetTimer();
      queue.forEach((item) => {
        if (item.status === "pending") {
          item.status = "aborted";
        }
      });
      queue = [];
    }
    function subscribe(callback, overwrite) {
      if (overwrite) {
        doneCallbacks = [];
      }
      if (typeof callback === "function") {
        doneCallbacks.push(callback);
      }
    }
    function getQueryStatus() {
      return {
        startTime,
        payload,
        status,
        queriesSent,
        queriesPending: queue.length,
        subscribe,
        abort
      };
    }
    function failQuery() {
      status = "failed";
      doneCallbacks.forEach((callback) => {
        callback(void 0, lastError);
      });
    }
    function clearQueue() {
      queue.forEach((item) => {
        if (item.status === "pending") {
          item.status = "aborted";
        }
      });
      queue = [];
    }
    function moduleResponse(item, response, data) {
      const isError = response !== "success";
      queue = queue.filter((queued) => queued !== item);
      switch (status) {
        case "pending":
          break;
        case "failed":
          if (isError || !config.dataAfterTimeout) {
            return;
          }
          break;
        default:
          return;
      }
      if (response === "abort") {
        lastError = data;
        failQuery();
        return;
      }
      if (isError) {
        lastError = data;
        if (!queue.length) {
          if (!resources.length) {
            failQuery();
          } else {
            execNext();
          }
        }
        return;
      }
      resetTimer();
      clearQueue();
      if (!config.random) {
        const index = config.resources.indexOf(item.resource);
        if (index !== -1 && index !== config.index) {
          config.index = index;
        }
      }
      status = "completed";
      doneCallbacks.forEach((callback) => {
        callback(data);
      });
    }
    function execNext() {
      if (status !== "pending") {
        return;
      }
      resetTimer();
      const resource = resources.shift();
      if (resource === void 0) {
        if (queue.length) {
          timer = setTimeout(() => {
            resetTimer();
            if (status === "pending") {
              clearQueue();
              failQuery();
            }
          }, config.timeout);
          return;
        }
        failQuery();
        return;
      }
      const item = {
        status: "pending",
        resource,
        callback: (status2, data) => {
          moduleResponse(item, status2, data);
        }
      };
      queue.push(item);
      queriesSent++;
      timer = setTimeout(execNext, config.rotate);
      query(resource, payload, item.callback);
    }
    setTimeout(execNext);
    return getQueryStatus;
  }

  // src/index.ts
  function initRedundancy(cfg) {
    const config = {
      ...defaultConfig,
      ...cfg
    };
    let queries = [];
    function cleanup() {
      queries = queries.filter((item) => item().status === "pending");
    }
    function query(payload, queryCallback, doneCallback) {
      const query2 = sendQuery(
        config,
        payload,
        queryCallback,
        (data, error) => {
          cleanup();
          if (doneCallback) {
            doneCallback(data, error);
          }
        }
      );
      queries.push(query2);
      return query2;
    }
    function find(callback) {
      return queries.find((value) => {
        return callback(value);
      }) || null;
    }
    const instance = {
      query,
      find,
      setIndex: (index) => {
        config.index = index;
      },
      getIndex: () => config.index,
      cleanup
    };
    return instance;
  }

  function createAPIConfig(source) {
    let resources;
    if (typeof source.resources === "string") {
      resources = [source.resources];
    } else {
      resources = source.resources;
      if (!(resources instanceof Array) || !resources.length) {
        return null;
      }
    }
    const result = {
      // API hosts
      resources,
      // Root path
      path: source.path || "/",
      // URL length limit
      maxURL: source.maxURL || 500,
      // Timeout before next host is used.
      rotate: source.rotate || 750,
      // Timeout before failing query.
      timeout: source.timeout || 5e3,
      // Randomise default API end point.
      random: source.random === true,
      // Start index
      index: source.index || 0,
      // Receive data after time out (used if time out kicks in first, then API module sends data anyway).
      dataAfterTimeout: source.dataAfterTimeout !== false
    };
    return result;
  }
  const configStorage = /* @__PURE__ */ Object.create(null);
  const fallBackAPISources = [
    "https://api.simplesvg.com",
    "https://api.unisvg.com"
  ];
  const fallBackAPI = [];
  while (fallBackAPISources.length > 0) {
    if (fallBackAPISources.length === 1) {
      fallBackAPI.push(fallBackAPISources.shift());
    } else {
      if (Math.random() > 0.5) {
        fallBackAPI.push(fallBackAPISources.shift());
      } else {
        fallBackAPI.push(fallBackAPISources.pop());
      }
    }
  }
  configStorage[""] = createAPIConfig({
    resources: ["https://api.iconify.design"].concat(fallBackAPI)
  });
  function addAPIProvider(provider, customConfig) {
    const config = createAPIConfig(customConfig);
    if (config === null) {
      return false;
    }
    configStorage[provider] = config;
    return true;
  }
  function getAPIConfig(provider) {
    return configStorage[provider];
  }
  function listAPIProviders() {
    return Object.keys(configStorage);
  }

  function emptyCallback$1() {
  }
  const redundancyCache = /* @__PURE__ */ Object.create(null);
  function getRedundancyCache(provider) {
    if (!redundancyCache[provider]) {
      const config = getAPIConfig(provider);
      if (!config) {
        return;
      }
      const redundancy = initRedundancy(config);
      const cachedReundancy = {
        config,
        redundancy
      };
      redundancyCache[provider] = cachedReundancy;
    }
    return redundancyCache[provider];
  }
  function sendAPIQuery(target, query, callback) {
    let redundancy;
    let send;
    if (typeof target === "string") {
      const api = getAPIModule(target);
      if (!api) {
        callback(void 0, 424);
        return emptyCallback$1;
      }
      send = api.send;
      const cached = getRedundancyCache(target);
      if (cached) {
        redundancy = cached.redundancy;
      }
    } else {
      const config = createAPIConfig(target);
      if (config) {
        redundancy = initRedundancy(config);
        const moduleKey = target.resources ? target.resources[0] : "";
        const api = getAPIModule(moduleKey);
        if (api) {
          send = api.send;
        }
      }
    }
    if (!redundancy || !send) {
      callback(void 0, 424);
      return emptyCallback$1;
    }
    return redundancy.query(query, send, callback)().abort;
  }

  function emptyCallback() {
  }
  function loadedNewIcons(storage) {
    if (!storage.iconsLoaderFlag) {
      storage.iconsLoaderFlag = true;
      setTimeout(() => {
        storage.iconsLoaderFlag = false;
        updateCallbacks(storage);
      });
    }
  }
  function checkIconNamesForAPI(icons) {
    const valid = [];
    const invalid = [];
    icons.forEach((name) => {
      (name.match(matchIconName) ? valid : invalid).push(name);
    });
    return {
      valid,
      invalid
    };
  }
  function parseLoaderResponse(storage, icons, data) {
    function checkMissing() {
      const pending = storage.pendingIcons;
      icons.forEach((name) => {
        if (pending) {
          pending.delete(name);
        }
        if (!storage.icons[name]) {
          storage.missing.add(name);
        }
      });
    }
    if (data && typeof data === "object") {
      try {
        const parsed = addIconSet(storage, data);
        if (!parsed.length) {
          checkMissing();
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }
    checkMissing();
    loadedNewIcons(storage);
  }
  function parsePossiblyAsyncResponse(response, callback) {
    if (response instanceof Promise) {
      response.then((data) => {
        callback(data);
      }).catch(() => {
        callback(null);
      });
    } else {
      callback(response);
    }
  }
  function loadNewIcons(storage, icons) {
    if (!storage.iconsToLoad) {
      storage.iconsToLoad = icons;
    } else {
      storage.iconsToLoad = storage.iconsToLoad.concat(icons).sort();
    }
    if (!storage.iconsQueueFlag) {
      storage.iconsQueueFlag = true;
      setTimeout(() => {
        storage.iconsQueueFlag = false;
        const { provider, prefix } = storage;
        const icons2 = storage.iconsToLoad;
        delete storage.iconsToLoad;
        if (!icons2 || !icons2.length) {
          return;
        }
        const customIconLoader = storage.loadIcon;
        if (storage.loadIcons && (icons2.length > 1 || !customIconLoader)) {
          parsePossiblyAsyncResponse(
            storage.loadIcons(icons2, prefix, provider),
            (data) => {
              parseLoaderResponse(storage, icons2, data);
            }
          );
          return;
        }
        if (customIconLoader) {
          icons2.forEach((name) => {
            const response = customIconLoader(name, prefix, provider);
            parsePossiblyAsyncResponse(response, (data) => {
              const iconSet = data ? {
                prefix,
                icons: {
                  [name]: data
                }
              } : null;
              parseLoaderResponse(storage, [name], iconSet);
            });
          });
          return;
        }
        const { valid, invalid } = checkIconNamesForAPI(icons2);
        if (invalid.length) {
          parseLoaderResponse(storage, invalid, null);
        }
        if (!valid.length) {
          return;
        }
        const api = prefix.match(matchIconName) ? getAPIModule(provider) : null;
        if (!api) {
          parseLoaderResponse(storage, valid, null);
          return;
        }
        const params = api.prepare(provider, prefix, valid);
        params.forEach((item) => {
          sendAPIQuery(provider, item, (data) => {
            parseLoaderResponse(storage, item.icons, data);
          });
        });
      });
    }
  }
  const loadIcons = (icons, callback) => {
    const cleanedIcons = listToIcons(icons, true, allowSimpleNames());
    const sortedIcons = sortIcons(cleanedIcons);
    if (!sortedIcons.pending.length) {
      let callCallback = true;
      if (callback) {
        setTimeout(() => {
          if (callCallback) {
            callback(
              sortedIcons.loaded,
              sortedIcons.missing,
              sortedIcons.pending,
              emptyCallback
            );
          }
        });
      }
      return () => {
        callCallback = false;
      };
    }
    const newIcons = /* @__PURE__ */ Object.create(null);
    const sources = [];
    let lastProvider, lastPrefix;
    sortedIcons.pending.forEach((icon) => {
      const { provider, prefix } = icon;
      if (prefix === lastPrefix && provider === lastProvider) {
        return;
      }
      lastProvider = provider;
      lastPrefix = prefix;
      sources.push(getStorage(provider, prefix));
      const providerNewIcons = newIcons[provider] || (newIcons[provider] = /* @__PURE__ */ Object.create(null));
      if (!providerNewIcons[prefix]) {
        providerNewIcons[prefix] = [];
      }
    });
    sortedIcons.pending.forEach((icon) => {
      const { provider, prefix, name } = icon;
      const storage = getStorage(provider, prefix);
      const pendingQueue = storage.pendingIcons || (storage.pendingIcons = /* @__PURE__ */ new Set());
      if (!pendingQueue.has(name)) {
        pendingQueue.add(name);
        newIcons[provider][prefix].push(name);
      }
    });
    sources.forEach((storage) => {
      const list = newIcons[storage.provider][storage.prefix];
      if (list.length) {
        loadNewIcons(storage, list);
      }
    });
    return callback ? storeCallback(callback, sortedIcons, sources) : emptyCallback;
  };
  const loadIcon = (icon) => {
    return new Promise((fulfill, reject) => {
      const iconObj = typeof icon === "string" ? stringToIcon(icon, true) : icon;
      if (!iconObj) {
        reject(icon);
        return;
      }
      loadIcons([iconObj || icon], (loaded) => {
        if (loaded.length && iconObj) {
          const data = getIconData(iconObj);
          if (data) {
            fulfill({
              ...defaultIconProps,
              ...data
            });
            return;
          }
        }
        reject(icon);
      });
    });
  };

  /**
   * Test icon string
   */
  function testIconObject(value) {
      try {
          const obj = typeof value === 'string' ? JSON.parse(value) : value;
          if (typeof obj.body === 'string') {
              return {
                  ...obj,
              };
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
      }
      catch (err) {
          //
      }
  }

  /**
   * Parse icon value, load if needed
   */
  function parseIconValue(value, onload) {
      if (typeof value === 'object') {
          const data = testIconObject(value);
          return {
              data,
              value,
          };
      }
      if (typeof value !== 'string') {
          // Invalid value
          return {
              value,
          };
      }
      // Check for JSON
      if (value.includes('{')) {
          const data = testIconObject(value);
          if (data) {
              return {
                  data,
                  value,
              };
          }
      }
      // Parse icon name
      const name = stringToIcon(value, true, true);
      if (!name) {
          return {
              value,
          };
      }
      // Valid icon name: check if data is available
      const data = getIconData(name);
      // Icon data exists or icon has no prefix. Do not load icon from API if icon has no prefix
      if (data !== undefined || !name.prefix) {
          return {
              value,
              name,
              data, // could be 'null' -> icon is missing
          };
      }
      // Load icon
      const loading = loadIcons([name], () => onload(value, name, getIconData(name)));
      return {
          value,
          name,
          loading,
      };
  }

  // Check for Safari
  let isBuggedSafari = false;
  try {
      isBuggedSafari = navigator.vendor.indexOf('Apple') === 0;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
  }
  catch (err) {
      //
  }
  /**
   * Get render mode
   */
  function getRenderMode(body, mode) {
      switch (mode) {
          // Force mode
          case 'svg':
          case 'bg':
          case 'mask':
              return mode;
      }
      // Check for animation, use 'style' for animated icons, unless browser is Safari
      // (only <a>, which should be ignored or animations start with '<a')
      if (mode !== 'style' &&
          (isBuggedSafari || body.indexOf('<a') === -1)) {
          // Render <svg>
          return 'svg';
      }
      // Use background or mask
      return body.indexOf('currentColor') === -1 ? 'bg' : 'mask';
  }

  const unitsSplit = /(-?[0-9.]*[0-9]+[0-9.]*)/g;
  const unitsTest = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
  function calculateSize(size, ratio, precision) {
    if (ratio === 1) {
      return size;
    }
    precision = precision || 100;
    if (typeof size === "number") {
      return Math.ceil(size * ratio * precision) / precision;
    }
    if (typeof size !== "string") {
      return size;
    }
    const oldParts = size.split(unitsSplit);
    if (oldParts === null || !oldParts.length) {
      return size;
    }
    const newParts = [];
    let code = oldParts.shift();
    let isNumber = unitsTest.test(code);
    while (true) {
      if (isNumber) {
        const num = parseFloat(code);
        if (isNaN(num)) {
          newParts.push(code);
        } else {
          newParts.push(Math.ceil(num * ratio * precision) / precision);
        }
      } else {
        newParts.push(code);
      }
      code = oldParts.shift();
      if (code === void 0) {
        return newParts.join("");
      }
      isNumber = !isNumber;
    }
  }

  function splitSVGDefs(content, tag = "defs") {
    let defs = "";
    const index = content.indexOf("<" + tag);
    while (index >= 0) {
      const start = content.indexOf(">", index);
      const end = content.indexOf("</" + tag);
      if (start === -1 || end === -1) {
        break;
      }
      const endEnd = content.indexOf(">", end);
      if (endEnd === -1) {
        break;
      }
      defs += content.slice(start + 1, end).trim();
      content = content.slice(0, index).trim() + content.slice(endEnd + 1);
    }
    return {
      defs,
      content
    };
  }
  function mergeDefsAndContent(defs, content) {
    return defs ? "<defs>" + defs + "</defs>" + content : content;
  }
  function wrapSVGContent(body, start, end) {
    const split = splitSVGDefs(body);
    return mergeDefsAndContent(split.defs, start + split.content + end);
  }

  const isUnsetKeyword = (value) => value === "unset" || value === "undefined" || value === "none";
  function iconToSVG(icon, customisations) {
    const fullIcon = {
      ...defaultIconProps,
      ...icon
    };
    const fullCustomisations = {
      ...defaultIconCustomisations,
      ...customisations
    };
    const box = {
      left: fullIcon.left,
      top: fullIcon.top,
      width: fullIcon.width,
      height: fullIcon.height
    };
    let body = fullIcon.body;
    [fullIcon, fullCustomisations].forEach((props) => {
      const transformations = [];
      const hFlip = props.hFlip;
      const vFlip = props.vFlip;
      let rotation = props.rotate;
      if (hFlip) {
        if (vFlip) {
          rotation += 2;
        } else {
          transformations.push(
            "translate(" + (box.width + box.left).toString() + " " + (0 - box.top).toString() + ")"
          );
          transformations.push("scale(-1 1)");
          box.top = box.left = 0;
        }
      } else if (vFlip) {
        transformations.push(
          "translate(" + (0 - box.left).toString() + " " + (box.height + box.top).toString() + ")"
        );
        transformations.push("scale(1 -1)");
        box.top = box.left = 0;
      }
      let tempValue;
      if (rotation < 0) {
        rotation -= Math.floor(rotation / 4) * 4;
      }
      rotation = rotation % 4;
      switch (rotation) {
        case 1:
          tempValue = box.height / 2 + box.top;
          transformations.unshift(
            "rotate(90 " + tempValue.toString() + " " + tempValue.toString() + ")"
          );
          break;
        case 2:
          transformations.unshift(
            "rotate(180 " + (box.width / 2 + box.left).toString() + " " + (box.height / 2 + box.top).toString() + ")"
          );
          break;
        case 3:
          tempValue = box.width / 2 + box.left;
          transformations.unshift(
            "rotate(-90 " + tempValue.toString() + " " + tempValue.toString() + ")"
          );
          break;
      }
      if (rotation % 2 === 1) {
        if (box.left !== box.top) {
          tempValue = box.left;
          box.left = box.top;
          box.top = tempValue;
        }
        if (box.width !== box.height) {
          tempValue = box.width;
          box.width = box.height;
          box.height = tempValue;
        }
      }
      if (transformations.length) {
        body = wrapSVGContent(
          body,
          '<g transform="' + transformations.join(" ") + '">',
          "</g>"
        );
      }
    });
    const customisationsWidth = fullCustomisations.width;
    const customisationsHeight = fullCustomisations.height;
    const boxWidth = box.width;
    const boxHeight = box.height;
    let width;
    let height;
    if (customisationsWidth === null) {
      height = customisationsHeight === null ? "1em" : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
      width = calculateSize(height, boxWidth / boxHeight);
    } else {
      width = customisationsWidth === "auto" ? boxWidth : customisationsWidth;
      height = customisationsHeight === null ? calculateSize(width, boxHeight / boxWidth) : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
    }
    const attributes = {};
    const setAttr = (prop, value) => {
      if (!isUnsetKeyword(value)) {
        attributes[prop] = value.toString();
      }
    };
    setAttr("width", width);
    setAttr("height", height);
    const viewBox = [box.left, box.top, boxWidth, boxHeight];
    attributes.viewBox = viewBox.join(" ");
    return {
      attributes,
      viewBox,
      body
    };
  }

  function iconToHTML(body, attributes) {
    let renderAttribsHTML = body.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
    for (const attr in attributes) {
      renderAttribsHTML += " " + attr + '="' + attributes[attr] + '"';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg"' + renderAttribsHTML + ">" + body + "</svg>";
  }

  function encodeSVGforURL(svg) {
    return svg.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ");
  }
  function svgToData(svg) {
    return "data:image/svg+xml," + encodeSVGforURL(svg);
  }
  function svgToURL(svg) {
    return 'url("' + svgToData(svg) + '")';
  }

  const detectFetch = () => {
    let callback;
    try {
      callback = fetch;
      if (typeof callback === "function") {
        return callback;
      }
    } catch (err) {
    }
  };
  let fetchModule = detectFetch();
  function setFetch(fetch2) {
    fetchModule = fetch2;
  }
  function getFetch() {
    return fetchModule;
  }
  function calculateMaxLength(provider, prefix) {
    const config = getAPIConfig(provider);
    if (!config) {
      return 0;
    }
    let result;
    if (!config.maxURL) {
      result = 0;
    } else {
      let maxHostLength = 0;
      config.resources.forEach((item) => {
        const host = item;
        maxHostLength = Math.max(maxHostLength, host.length);
      });
      const url = prefix + ".json?icons=";
      result = config.maxURL - maxHostLength - config.path.length - url.length;
    }
    return result;
  }
  function shouldAbort(status) {
    return status === 404;
  }
  const prepare = (provider, prefix, icons) => {
    const results = [];
    const maxLength = calculateMaxLength(provider, prefix);
    const type = "icons";
    let item = {
      type,
      provider,
      prefix,
      icons: []
    };
    let length = 0;
    icons.forEach((name, index) => {
      length += name.length + 1;
      if (length >= maxLength && index > 0) {
        results.push(item);
        item = {
          type,
          provider,
          prefix,
          icons: []
        };
        length = name.length;
      }
      item.icons.push(name);
    });
    results.push(item);
    return results;
  };
  function getPath(provider) {
    if (typeof provider === "string") {
      const config = getAPIConfig(provider);
      if (config) {
        return config.path;
      }
    }
    return "/";
  }
  const send = (host, params, callback) => {
    if (!fetchModule) {
      callback("abort", 424);
      return;
    }
    let path = getPath(params.provider);
    switch (params.type) {
      case "icons": {
        const prefix = params.prefix;
        const icons = params.icons;
        const iconsList = icons.join(",");
        const urlParams = new URLSearchParams({
          icons: iconsList
        });
        path += prefix + ".json?" + urlParams.toString();
        break;
      }
      case "custom": {
        const uri = params.uri;
        path += uri.slice(0, 1) === "/" ? uri.slice(1) : uri;
        break;
      }
      default:
        callback("abort", 400);
        return;
    }
    let defaultError = 503;
    fetchModule(host + path).then((response) => {
      const status = response.status;
      if (status !== 200) {
        setTimeout(() => {
          callback(shouldAbort(status) ? "abort" : "next", status);
        });
        return;
      }
      defaultError = 501;
      return response.json();
    }).then((data) => {
      if (typeof data !== "object" || data === null) {
        setTimeout(() => {
          if (data === 404) {
            callback("abort", data);
          } else {
            callback("next", defaultError);
          }
        });
        return;
      }
      setTimeout(() => {
        callback("success", data);
      });
    }).catch(() => {
      callback("next", defaultError);
    });
  };
  const fetchAPIModule = {
    prepare,
    send
  };

  function setCustomIconsLoader(loader, prefix, provider) {
    getStorage(provider || "", prefix).loadIcons = loader;
  }
  function setCustomIconLoader(loader, prefix, provider) {
    getStorage(provider || "", prefix).loadIcon = loader;
  }

  /**
   * Attribute to add
   */
  const nodeAttr = 'data-style';
  /**
   * Custom style to add to each node
   */
  let customStyle = '';
  /**
   * Set custom style to add to all components
   *
   * Affects only components rendered after function call
   */
  function appendCustomStyle(style) {
      customStyle = style;
  }
  /**
   * Add/update style node
   */
  function updateStyle(parent, inline) {
      // Get node, create if needed
      let styleNode = Array.from(parent.childNodes).find((node) => node.hasAttribute &&
          node.hasAttribute(nodeAttr));
      if (!styleNode) {
          styleNode = document.createElement('style');
          styleNode.setAttribute(nodeAttr, nodeAttr);
          parent.appendChild(styleNode);
      }
      // Update content
      styleNode.textContent =
          ':host{display:inline-block;vertical-align:' +
              (inline ? '-0.125em' : '0') +
              '}span,svg{display:block;margin:auto}' +
              customStyle;
  }

  // Core
  /**
   * Get functions and initialise stuff
   */
  function exportFunctions() {
      /**
       * Initialise stuff
       */
      // Set API module
      setAPIModule('', fetchAPIModule);
      // Allow simple icon names
      allowSimpleNames(true);
      let _window;
      try {
          _window = window;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
      }
      catch (err) {
          //
      }
      if (_window) {
          // Load icons from global "IconifyPreload"
          if (_window.IconifyPreload !== void 0) {
              const preload = _window.IconifyPreload;
              const err = 'Invalid IconifyPreload syntax.';
              if (typeof preload === 'object' && preload !== null) {
                  (preload instanceof Array ? preload : [preload]).forEach((item) => {
                      try {
                          if (
                          // Check if item is an object and not null/array
                          typeof item !== 'object' ||
                              item === null ||
                              item instanceof Array ||
                              // Check for 'icons' and 'prefix'
                              typeof item.icons !== 'object' ||
                              typeof item.prefix !== 'string' ||
                              // Add icon set
                              !addCollection(item)) {
                              console.error(err);
                          }
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      }
                      catch (e) {
                          console.error(err);
                      }
                  });
              }
          }
          // Set API from global "IconifyProviders"
          if (_window.IconifyProviders !== void 0) {
              const providers = _window.IconifyProviders;
              if (typeof providers === 'object' && providers !== null) {
                  for (const key in providers) {
                      const err = 'IconifyProviders[' + key + '] is invalid.';
                      try {
                          const value = providers[key];
                          if (typeof value !== 'object' ||
                              !value ||
                              value.resources === void 0) {
                              continue;
                          }
                          if (!addAPIProvider(key, value)) {
                              console.error(err);
                          }
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      }
                      catch (e) {
                          console.error(err);
                      }
                  }
              }
          }
      }
      const _api = {
          getAPIConfig,
          setAPIModule,
          sendAPIQuery,
          setFetch,
          getFetch,
          listAPIProviders,
      };
      return {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          enableCache: (storage) => {
              // No longer used
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          disableCache: (storage) => {
              // No longer used
          },
          iconLoaded,
          iconExists: iconLoaded, // deprecated, kept to avoid breaking changes
          getIcon,
          listIcons,
          addIcon,
          addCollection,
          calculateSize,
          buildIcon: iconToSVG,
          iconToHTML,
          svgToURL,
          loadIcons,
          loadIcon,
          addAPIProvider,
          setCustomIconLoader,
          setCustomIconsLoader,
          appendCustomStyle,
          _api,
      };
  }

  // List of properties to apply
  const monotoneProps = {
      'background-color': 'currentColor',
  };
  const coloredProps = {
      'background-color': 'transparent',
  };
  // Dynamically add common props to variables above
  const propsToAdd = {
      image: 'var(--svg)',
      repeat: 'no-repeat',
      size: '100% 100%',
  };
  const propsToAddTo = {
      '-webkit-mask': monotoneProps,
      'mask': monotoneProps,
      'background': coloredProps,
  };
  for (const prefix in propsToAddTo) {
      const list = propsToAddTo[prefix];
      for (const prop in propsToAdd) {
          list[prefix + '-' + prop] = propsToAdd[prop];
      }
  }
  /**
   * Fix size: add 'px' to numbers
   */
  function fixSize(value) {
      return value ? value + (value.match(/^[-0-9.]+$/) ? 'px' : '') : 'inherit';
  }
  /**
   * Render node as <span>
   */
  function renderSPAN(data, icon, useMask) {
      const node = document.createElement('span');
      // Body
      let body = data.body;
      if (body.indexOf('<a') !== -1) {
          // Animated SVG: add something to fix timing bug
          body += '<!-- ' + Date.now() + ' -->';
      }
      // Generate SVG as URL
      const renderAttribs = data.attributes;
      const html = iconToHTML(body, {
          ...renderAttribs,
          width: icon.width + '',
          height: icon.height + '',
      });
      const url = svgToURL(html);
      // Generate style
      const svgStyle = node.style;
      const styles = {
          '--svg': url,
          'width': fixSize(renderAttribs.width),
          'height': fixSize(renderAttribs.height),
          ...(useMask ? monotoneProps : coloredProps),
      };
      // Apply style
      for (const prop in styles) {
          svgStyle.setProperty(prop, styles[prop]);
      }
      return node;
  }

  let policy;
  function createPolicy() {
    try {
      policy = window.trustedTypes.createPolicy("iconify", {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        createHTML: (s) => s
      });
    } catch (err) {
      policy = null;
    }
  }
  function cleanUpInnerHTML(html) {
    if (policy === void 0) {
      createPolicy();
    }
    return policy ? policy.createHTML(html) : html;
  }

  /**
   * Render node as <svg>
   */
  function renderSVG(data) {
      const node = document.createElement('span');
      // Add style if needed
      const attr = data.attributes;
      let style = '';
      if (!attr.width) {
          style = 'width: inherit;';
      }
      if (!attr.height) {
          style += 'height: inherit;';
      }
      if (style) {
          attr.style = style;
      }
      // Generate SVG
      const html = iconToHTML(data.body, attr);
      node.innerHTML = cleanUpInnerHTML(html);
      return node.firstChild;
  }

  /**
   * Find icon node
   */
  function findIconElement(parent) {
      return Array.from(parent.childNodes).find((node) => {
          const tag = node.tagName &&
              node.tagName.toUpperCase();
          return tag === 'SPAN' || tag === 'SVG';
      });
  }
  /**
   * Render icon
   */
  function renderIcon(parent, state) {
      const iconData = state.icon.data;
      const customisations = state.customisations;
      // Render icon
      const renderData = iconToSVG(iconData, customisations);
      if (customisations.preserveAspectRatio) {
          renderData.attributes['preserveAspectRatio'] =
              customisations.preserveAspectRatio;
      }
      const mode = state.renderedMode;
      let node;
      switch (mode) {
          case 'svg':
              node = renderSVG(renderData);
              break;
          default:
              node = renderSPAN(renderData, {
                  ...defaultIconProps,
                  ...iconData,
              }, mode === 'mask');
      }
      // Set element
      const oldNode = findIconElement(parent);
      if (oldNode) {
          // Replace old element
          if (node.tagName === 'SPAN' && oldNode.tagName === node.tagName) {
              // Swap style instead of whole node
              oldNode.setAttribute('style', node.getAttribute('style'));
          }
          else {
              parent.replaceChild(node, oldNode);
          }
      }
      else {
          // Add new element
          parent.appendChild(node);
      }
  }

  /**
   * Set state to PendingState
   */
  function setPendingState(icon, inline, lastState) {
      const lastRender = lastState &&
          (lastState.rendered
              ? lastState
              : lastState.lastRender);
      return {
          rendered: false,
          inline,
          icon,
          lastRender,
      };
  }

  /**
   * Register 'iconify-icon' component, if it does not exist
   */
  function defineIconifyIcon(name = 'iconify-icon') {
      // Check for custom elements registry and HTMLElement
      let customElements;
      let ParentClass;
      try {
          customElements = window.customElements;
          ParentClass = window.HTMLElement;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
      }
      catch (err) {
          return;
      }
      // Make sure registry and HTMLElement exist
      if (!customElements || !ParentClass) {
          return;
      }
      // Check for duplicate
      const ConflictingClass = customElements.get(name);
      if (ConflictingClass) {
          return ConflictingClass;
      }
      // All attributes
      const attributes = [
          // Icon
          'icon',
          // Mode
          'mode',
          'inline',
          'noobserver',
          // Customisations
          'width',
          'height',
          'rotate',
          'flip',
      ];
      /**
       * Component class
       */
      const IconifyIcon = class extends ParentClass {
          // Root
          _shadowRoot;
          // Initialised
          _initialised = false;
          // Icon state
          _state;
          // Attributes check queued
          _checkQueued = false;
          // Connected
          _connected = false;
          // Observer
          _observer = null;
          _visible = true;
          /**
           * Constructor
           */
          constructor() {
              super();
              // Attach shadow DOM
              const root = (this._shadowRoot = this.attachShadow({
                  mode: 'open',
              }));
              // Add style
              const inline = this.hasAttribute('inline');
              updateStyle(root, inline);
              // Create empty state
              this._state = setPendingState({
                  value: '',
              }, inline);
              // Queue icon render
              this._queueCheck();
          }
          /**
           * Connected to DOM
           */
          connectedCallback() {
              this._connected = true;
              this.startObserver();
          }
          /**
           * Disconnected from DOM
           */
          disconnectedCallback() {
              this._connected = false;
              this.stopObserver();
          }
          /**
           * Observed attributes
           */
          static get observedAttributes() {
              return attributes.slice(0);
          }
          /**
           * Observed properties that are different from attributes
           *
           * Experimental! Need to test with various frameworks that support it
           */
          /*
          static get properties() {
              return {
                  inline: {
                      type: Boolean,
                      reflect: true,
                  },
                  // Not listing other attributes because they are strings or combination
                  // of string and another type. Cannot have multiple types
              };
          }
          */
          /**
           * Attribute has changed
           */
          attributeChangedCallback(name) {
              switch (name) {
                  case 'inline': {
                      // Update immediately: not affected by other attributes
                      const newInline = this.hasAttribute('inline');
                      const state = this._state;
                      if (newInline !== state.inline) {
                          // Update style if inline mode changed
                          state.inline = newInline;
                          updateStyle(this._shadowRoot, newInline);
                      }
                      break;
                  }
                  case 'noobserver': {
                      const value = this.hasAttribute('noobserver');
                      if (value) {
                          this.startObserver();
                      }
                      else {
                          this.stopObserver();
                      }
                      break;
                  }
                  default:
                      // Queue check for other attributes
                      this._queueCheck();
              }
          }
          /**
           * Get/set icon
           */
          get icon() {
              const value = this.getAttribute('icon');
              if (value && value.slice(0, 1) === '{') {
                  try {
                      return JSON.parse(value);
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  }
                  catch (err) {
                      //
                  }
              }
              return value;
          }
          set icon(value) {
              if (typeof value === 'object') {
                  value = JSON.stringify(value);
              }
              this.setAttribute('icon', value);
          }
          /**
           * Get/set inline
           */
          get inline() {
              return this.hasAttribute('inline');
          }
          set inline(value) {
              if (value) {
                  this.setAttribute('inline', 'true');
              }
              else {
                  this.removeAttribute('inline');
              }
          }
          /**
           * Get/set observer
           */
          get observer() {
              return this.hasAttribute('observer');
          }
          set observer(value) {
              if (value) {
                  this.setAttribute('observer', 'true');
              }
              else {
                  this.removeAttribute('observer');
              }
          }
          /**
           * Restart animation
           */
          restartAnimation() {
              const state = this._state;
              if (state.rendered) {
                  const root = this._shadowRoot;
                  if (state.renderedMode === 'svg') {
                      // Update root node
                      try {
                          root.lastChild.setCurrentTime(0);
                          return;
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      }
                      catch (err) {
                          // Failed: setCurrentTime() is not supported
                      }
                  }
                  renderIcon(root, state);
              }
          }
          /**
           * Get status
           */
          get status() {
              const state = this._state;
              return state.rendered
                  ? 'rendered'
                  : state.icon.data === null
                      ? 'failed'
                      : 'loading';
          }
          /**
           * Queue attributes re-check
           */
          _queueCheck() {
              if (!this._checkQueued) {
                  this._checkQueued = true;
                  setTimeout(() => {
                      this._check();
                  });
              }
          }
          /**
           * Check for changes
           */
          _check() {
              if (!this._checkQueued) {
                  return;
              }
              this._checkQueued = false;
              const state = this._state;
              // Get icon
              const newIcon = this.getAttribute('icon');
              if (newIcon !== state.icon.value) {
                  this._iconChanged(newIcon);
                  return;
              }
              // Ignore other attributes if icon is not rendered
              if (!state.rendered || !this._visible) {
                  return;
              }
              // Check for mode and attribute changes
              const mode = this.getAttribute('mode');
              const customisations = getCustomisations(this);
              if (state.attrMode !== mode ||
                  haveCustomisationsChanged(state.customisations, customisations) ||
                  !findIconElement(this._shadowRoot)) {
                  this._renderIcon(state.icon, customisations, mode);
              }
          }
          /**
           * Icon value has changed
           */
          _iconChanged(newValue) {
              const icon = parseIconValue(newValue, (value, name, data) => {
                  // Asynchronous callback: re-check values to make sure stuff wasn't changed
                  const state = this._state;
                  if (state.rendered || this.getAttribute('icon') !== value) {
                      // Icon data is already available or icon attribute was changed
                      return;
                  }
                  // Change icon
                  const icon = {
                      value,
                      name,
                      data,
                  };
                  if (icon.data) {
                      // Render icon
                      this._gotIconData(icon);
                  }
                  else {
                      // Nothing to render: update icon in state
                      state.icon = icon;
                  }
              });
              if (icon.data) {
                  // Icon is ready to render
                  this._gotIconData(icon);
              }
              else {
                  // Pending icon
                  this._state = setPendingState(icon, this._state.inline, this._state);
              }
          }
          /**
           * Force render icon on state change
           */
          _forceRender() {
              if (!this._visible) {
                  // Remove icon
                  const node = findIconElement(this._shadowRoot);
                  if (node) {
                      this._shadowRoot.removeChild(node);
                  }
                  return;
              }
              // Re-render icon
              this._queueCheck();
          }
          /**
           * Got new icon data, icon is ready to (re)render
           */
          _gotIconData(icon) {
              this._checkQueued = false;
              this._renderIcon(icon, getCustomisations(this), this.getAttribute('mode'));
          }
          /**
           * Re-render based on icon data
           */
          _renderIcon(icon, customisations, attrMode) {
              // Get mode
              const renderedMode = getRenderMode(icon.data.body, attrMode);
              // Inline was not changed
              const inline = this._state.inline;
              // Set state and render
              renderIcon(this._shadowRoot, (this._state = {
                  rendered: true,
                  icon,
                  inline,
                  customisations,
                  attrMode,
                  renderedMode,
              }));
          }
          /**
           * Start observer
           */
          startObserver() {
              if (!this._observer && !this.hasAttribute('noobserver')) {
                  try {
                      this._observer = new IntersectionObserver((entries) => {
                          const intersecting = entries.some((entry) => entry.isIntersecting);
                          if (intersecting !== this._visible) {
                              this._visible = intersecting;
                              this._forceRender();
                          }
                      });
                      this._observer.observe(this);
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  }
                  catch (err) {
                      // Something went wrong, possibly observer is not supported
                      if (this._observer) {
                          try {
                              this._observer.disconnect();
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          }
                          catch (err) {
                              //
                          }
                          this._observer = null;
                      }
                  }
              }
          }
          /**
           * Stop observer
           */
          stopObserver() {
              if (this._observer) {
                  this._observer.disconnect();
                  this._observer = null;
                  this._visible = true;
                  if (this._connected) {
                      // Render icon
                      this._forceRender();
                  }
              }
          }
      };
      // Add getters and setters
      attributes.forEach((attr) => {
          if (!(attr in IconifyIcon.prototype)) {
              Object.defineProperty(IconifyIcon.prototype, attr, {
                  get: function () {
                      return this.getAttribute(attr);
                  },
                  set: function (value) {
                      if (value !== null) {
                          this.setAttribute(attr, value);
                      }
                      else {
                          this.removeAttribute(attr);
                      }
                  },
              });
          }
      });
      // Add exported functions: both as static and instance methods
      const functions = exportFunctions();
      for (const key in functions) {
          IconifyIcon[key] = IconifyIcon.prototype[key] = functions[key];
      }
      // Define new component
      customElements.define(name, IconifyIcon);
      return IconifyIcon;
  }

  // Register component
  defineIconifyIcon();

})();
