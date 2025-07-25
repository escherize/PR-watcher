export function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

export function groupBy(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}

export function parseUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    repo: params.get('repo'),
    query: params.get('query'),
    interval: params.get('interval')
  };
}

export function updateUrlParams(updates) {
  const url = new URL(window.location);
  const params = url.searchParams;
  
  Object.entries(updates).forEach(([key, value]) => {
    if (value && value.trim() !== '') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  });
  
  window.history.replaceState({}, '', url);
}
