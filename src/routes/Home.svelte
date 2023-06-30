<script>
  import { onMount } from "svelte";
  import { Button, Dropdown, TextInput, LocalStorage } from "carbon-components-svelte";

  import PullRequest from "@/components/PullRequest.svelte";
  import Layout from "@/components/Layout.svelte";
  import { userStore } from "@/stores/auth";
  import { getGHApi } from "@/lib/api";

  let repoInputValue = "";
  let pulls = [];
  let watchingPullIds = {};
  let watchInterval = 10000;

  console.log("Userstore", $userStore);
  function loadPullRequests() {
    getGHApi("search/issues",
      {q: `author:${$userStore.login} type:pr repo:${repoInputValue} state:open`})
      .then(resp => resp.json())
      .then(data => pulls = data.items);
  }

  function onToggleWatch(value, pullId) {
    if (value) watchingPullIds[pullId] = true
    else delete watchingPullIds[pullId]
  }

  onMount(() => {
    if (repoInputValue) loadPullRequests();
  })

</script>

<LocalStorage key="repo-input-value" bind:value={repoInputValue} />
<LocalStorage key="watching-pull-ids" bind:value={watchingPullIds} />

<Layout>
  <Dropdown
    itemToString={item => {
    console.log('item', item);
    const seconds = item / 1000;
    const minutes = seconds / 60;
    let string;
    if (minutes > 0) {
    string = `${minutes} minutes` + (seconds > 0) ? `, ${seconds} seconds` : "";
    } else {
    string = `${seconds} seconds`;
    }
    console.log("STRING", string);
    return string;
    }}
    items={[
    {id: "0", text: "5000"},
    {id: "1", text: "10000"},
    {id: "2", text: "30000"},
    {id: "3", text: "60000"},
    ]}
/>
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
          <PullRequest repo={repoInputValue} pull={pull}
                       watch={Boolean(watchingPullIds[pull.id])}
                       onToggleWatch={onToggleWatch}/>
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
