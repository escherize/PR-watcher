import { writable } from 'svelte/store';

export const tokenStore = writable(localStorage.getItem("PRW_TOKEN") || "");
tokenStore.subscribe(val => localStorage.setItem("PRW_TOKEN", val));

export const userStore = writable(null);
