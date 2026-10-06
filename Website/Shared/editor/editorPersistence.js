const STORAGE_KEY = 'js-building-editor-v1';

function readStore(storage = window.localStorage) {
  try {
    const value = JSON.parse(storage.getItem(STORAGE_KEY) || '{}');
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

function writeStore(store, storage = window.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage can be unavailable in private browsing or a restricted iframe.
  }
}

export function getEditorId(element, root) {
  if (!element || !root || element === root) return '';

  const parts = [];
  let current = element;
  while (current && current !== root) {
    const parent = current.parentElement;
    if (!parent) break;
    const index = Array.from(parent.children).indexOf(current) + 1;
    parts.unshift(`${current.tagName.toLowerCase()}:nth-child(${index})`);
    current = parent;
  }
  return parts.join('>');
}

export function getPageEdits(pathname, storage = window.localStorage) {
  const store = readStore(storage);
  const page = store[pathname];
  return page && typeof page === 'object' ? page : {};
}

export function setPageEdit(pathname, id, edit, storage = window.localStorage) {
  const store = readStore(storage);
  store[pathname] = {
    ...(store[pathname] || {}),
    [id]: {
      ...(store[pathname]?.[id] || {}),
      ...edit,
    },
  };
  writeStore(store, storage);
}

export function clearPageEdits(pathname, storage = window.localStorage) {
  const store = readStore(storage);
  delete store[pathname];
  writeStore(store, storage);
}

export function getStorageKey() {
  return STORAGE_KEY;
}
