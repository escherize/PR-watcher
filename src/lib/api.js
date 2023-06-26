import { tokenStore } from "@/stores/auth";
import { assert } from "@/lib/utils";

let tokenValue;
tokenStore.subscribe(value => {tokenValue = value});

const GH_API_URL = "https://api.github.com/"

function fetchGHApi(url, options = {}, token = tokenValue) {
  assert(token, "token must be non-empty");
  return fetch(GH_API_URL.concat(url), {
    headers: {'Authorization': 'Bearer ' + token},
    ...options
  });
}

export function getGHApi(url, params, token = tokenValue) {
  return fetchGHApi(url + "?" + new URLSearchParams(params), {}, token);
}

export function postGHApi(url, body, token = tokenValue) {
  return fetchGHApi(url, {method: "POST", body: JSON.stringify(body)}, token);
}
