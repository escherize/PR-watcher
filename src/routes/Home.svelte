<script>
  import { Button, TextInput, LocalStorage } from "carbon-components-svelte";

  import PullRequest from "@/components/PullRequest.svelte";
  import Layout from "@/components/Layout.svelte";
  import { userStore } from "@/stores/auth";
  import { getGHApi } from "@/lib/api";

  let repoInputValue = "";
  let pulls = [];

  function loadPullRequests() {
    getGHApi("search/issues",
      {q: `author:${$userStore.login} type:pr repo:${repoInputValue} state:open`})
      .then(resp => resp.json())
      .then(data => pulls = data.items);
  }
</script>

<LocalStorage bind:value={repoInputValue} />

<Layout>
  <div>
    <TextInput
      labelText="Repo"
      placeholder="metabase/metabase"
      bind:value={repoInputValue}/>

    <Button on:click={loadPullRequests}>
      Load
    </Button>

    {#each pulls as pull (pull.id)}
      <PullRequest pull={pull}/>
    {/each}
  </div>
</Layout>
