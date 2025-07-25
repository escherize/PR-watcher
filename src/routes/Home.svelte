<script>
  import { onMount } from "svelte";
  import { Button, Dropdown, TextInput, Toggle, LocalStorage } from "carbon-components-svelte";

  import PullRequest from "@/components/PullRequest.svelte";
  import Layout from "@/components/Layout.svelte";
  import { userStore } from "@/stores/auth";
  import { getGHApi } from "@/lib/api";
  import { parseUrlParams, updateUrlParams } from "@/lib/utils";

  let repoInputValue = "";
  let searchQuery = `state:open author:${$userStore.login}`;
  let pulls = [];
  let watchingPullIds = {};
  let watchInterval = 10000;
  let isInitialized = false;

  // Reactive URL syncing
  $: if (isInitialized) {
    updateUrlParams({
      repo: repoInputValue,
      query: searchQuery,
      interval: watchInterval.toString()
    });
  }

  function loadPullRequests() {
    if (!repoInputValue.trim()) {
      console.error("Repository name is required");
      return;
    }
    getGHApi("search/issues",
      {q: `${searchQuery} repo:${repoInputValue} type:pr`})
      .then(resp => resp.json())
      .then(data => pulls = data.items || [])
      .catch(err => {
        console.error("Failed to load pull requests:", err);
        pulls = [];
      });
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
    const urlParams = parseUrlParams();
    
    if (urlParams.repo) {
      repoInputValue = urlParams.repo;
    }
    
    if (urlParams.query) {
      searchQuery = urlParams.query;
    }
    
    if (urlParams.interval) {
      const intervalValue = parseInt(urlParams.interval);
      if (!isNaN(intervalValue)) {
        watchInterval = intervalValue;
      }
    }
    
    if (repoInputValue) {
      loadPullRequests();
    }
    
    isInitialized = true;
  })

</script>

<LocalStorage key="repo-input-value" bind:value={repoInputValue} />
<LocalStorage key="search-query" bind:value={searchQuery} />

<Layout>

  <Dropdown
    titleText="Watch PR internval"
    selectedId="2"
    itemToString={itemToStringWatchDropdown}
    on:select={(e => {
    watchInterval = parseInt(e.detail.selectedItem.text);
    })}
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

    <TextInput
      labelText="Search query"
      bind:value={searchQuery}/>

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
