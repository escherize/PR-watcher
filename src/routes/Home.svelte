<script>
  import { onMount } from "svelte";
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

  onMount(() => {
    if (repoInputValue) loadPullRequests();
  })

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

    <div id="pull-requests">
    {#each pulls as pull (pull.id)}
      {#if pull.pull_request.html_url == "https://github.com/metabase/metabase/pull/31540"}
      <PullRequest repo={repoInputValue} pull={pull}/>
      {/if}
    {/each}
    </div>
  </div>
</Layout>

<style>
  #pull-requests {
    border-top: 1px solid #e1e4e8;
    margin-top: 20px;
  }
</style>
