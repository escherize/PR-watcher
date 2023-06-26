<script>
  import { onMount } from 'svelte';
  import { Modal, TextInput } from "carbon-components-svelte";
  import { tokenStore, userStore } from "@/stores/auth";
  import { fetchGHApi } from "@/lib/api";

  let tokenValue, userValue;
  tokenStore.subscribe(value => {tokenValue = value});
  userStore.subscribe(value => {userValue = value});

  let shouldAskForToken = !tokenValue;
  let tokenInputValue = null;

  async function onSubmitToken(token) {
    const resp = await fetchGHApi("user", {}, token);
    if (resp.status == 200 ) {
      userStore.set(resp);
      tokenStore.set(token);
    }
  }

  onMount(async () => {
    // if token exists in local storage, fetch the user
    if (tokenValue && !userValue) {
      const resp = await fetchGHApi("user", {}, tokenValue);
      if (resp.status == 200 ) {
        tokenStore.set(tokenValue);
        userStore.set(resp);
      } else {
        tokenStore.set("");
        userStore.set(null);
      }
    }
  })
</script>

<div id="body">
  <Modal
    bind:open={shouldAskForToken}
    primaryButtonText={"Submit"}
    on:submit={() => {onSubmitToken(tokenInputValue)}}
    >
    <TextInput
      placeholder="Enter your GH token"
      bind:value={tokenInputValue}/>
  </Modal>

  <slot></slot>
</div>
