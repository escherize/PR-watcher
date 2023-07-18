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

  function itemToStringWatchDropdown(item) {
    const value = item.text / 1000; // in seconds
    const minutes = Math.floor(value / 60);
    const seconds = (value - minutes * 60);
    let components = [];
    if (minutes > 0) {
      components.push(`${minutes} minutes`);
    }
    if (seconds > 0){
      components.push(`${seconds} seconds`);
    }
    return components.join(", ");
  }

  onMount(() => {
    if (repoInputValue) loadPullRequests();
  })

</script>

<LocalStorage key="repo-input-value" bind:value={repoInputValue} />
<!--<LocalStorage key="watching-pull-ids" bind:value={watchingPullIds} />-->

<Layout>
  <Dropdown
    titleText="Watch PR internval"
    selectedId="2"
    itemToString={itemToStringWatchDropdown}
    on:select={(e => {
    watchInterval = parseInt(e.detail.selectedItem.text)})}
    items={[
    {id: "0", text: "30000"},
    {id: "1", text: "60000"},
    {id: "2", text: "120000"},
    {id: "3", text: "300000"},
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
        <!--{#if pull.pull_request.html_url == "https://github.com/metabase/metabase/pull/32469"}-->
          <PullRequest repo={repoInputValue} pull={pull}
                       watch={Boolean(watchingPullIds[pull.id])}
                       watchInterval={watchInterval}
                       onToggleWatch={onToggleWatch}/>
                       <!--{/if}-->
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
