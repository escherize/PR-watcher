<script>
  import { Modal, TextInput } from "carbon-components-svelte";
  import { userStore, tokenStore } from "@/stores/auth";
  let userValue;
  userStore.subscribe(value => {userValue = value});
  let isAuthorized = userValue == null;

  let tokenInputValue = null;
  async function onSubmitToken(token) {
    const resp = await fetch("https://api.github.com/user", {
      headers: {
        'Authorization': 'Bearer ' + token,
      }
    });
    if (resp.status == 200 ) {
      userStore.set(resp);
      tokenStore.set(tokenInputValue);

      var apiUrl = 'https://api.github.com/repos/metabase/metabase/pulls';

      fetch(apiUrl, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(response => response.json())
      .then(data => {
        console.log("DATA", data);

      })
    }
  }
</script>

<div id="body">
  <Modal
    bind:open={isAuthorized}
    primaryButtonText={"Submit"}
    on:submit={() => {onSubmitToken(tokenInputValue)}}
    >
    <TextInput
      placeholder="Enter your GH token"
      bind:value={tokenInputValue}/>
  </Modal>

  <slot></slot>
</div>
