<script>
  import { onMount } from 'svelte';
  import { path, prefs } from 'svelte-pathfinder';
  import { Modal, TextInput } from "carbon-components-svelte";
  import "carbon-components-svelte/css/white.css";

  import routes from '@/routes';
  import { tokenStore, userStore } from "@/stores/auth";
  import { getGHApi } from "@/lib/api";

  let tokenValue, userValue;
  tokenStore.subscribe(value => {tokenValue = value});
  userStore.subscribe(value => {userValue = value});

  $: shouldAskForToken = !tokenValue;
  let tokenInputValue = null;

  function onSubmitToken(token) {
    getGHApi("user", {}, token)
      .then(resp => resp.json())
      .then(data => {
        userStore.set(data);
        tokenStore.set(token);
      })
      .catch(err => {
        console.error("Failed to get user", err);
      });
  }

  onMount( () => {
    // if token exists in local storage, fetch the user
    if (tokenValue && !userValue) {
      getGHApi("user", {}, tokenValue)
        .then(resp => resp.json())
        .then(data => {
          tokenStore.set(tokenValue);
          userStore.set(data);
        })
        .catch(err => {
          console.error("Failed to get user", err);
          tokenStore.set("");
          userStore.set(null);
        });

    }
  })

  // Disable side effects to only keep history in browser memory.
  prefs.sideEffect = false;
  $: page = routes[$path] || routes['/']
</script>


<Modal
  bind:open={shouldAskForToken}
  primaryButtonText={"Submit"}
  on:submit={() => {onSubmitToken(tokenInputValue)}}
  >
  <TextInput
    placeholder="Enter your GH token"
    bind:value={tokenInputValue}/>
</Modal>

<div id="body">
  {#if userValue}
    <svelte:component this={page} />
  {/if}
</div>
