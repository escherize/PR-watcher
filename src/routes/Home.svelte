<script>
  import { onMount } from "svelte";
  import { Button, TextInput } from "carbon-components-svelte";

  import Layout from "@/components/Layout.svelte";
  import { getGHApi } from "@/lib/api";
  import { userStore } from "@/stores/auth";

  let userValue;
  userStore.subscribe(value => userValue = value);

  let pulls = [];

  let repoInputValue = "";

  function loadPullRequests() {
    getGHApi(`repos/${repoInputValue}/pulls`,
      {head: `user:${userValue.node_id}`,
        sort: "updated"})
      .then(resp => resp.json())
      .then(data => {
        console.log("pulls", data);
      });
  }

</script>

<Layout>
  <div class="">
    <TextInput
      labelText="Repo"
      placeholder="metabase/metabase"
      bind:value={repoInputValue}/>
    <Button on:click={loadPullRequests}>
      Load
    </Button>

  </div>
</Layout>
