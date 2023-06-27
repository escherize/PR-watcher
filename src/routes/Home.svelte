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

  async function loadPullRequests() {
    let resp = await getGHApi("search/issues",
      {q: `author:${userValue.login} type:pr repo:${repoInputValue} state:open`,
        per_page: 3}).then(resp => resp.json());
    pulls = resp.items;
    console.log("PULLS", pulls)

    let pull = pulls[pulls.length - 1];
    let pullDetail = await getGHApi(pull.pull_request.url).then(resp => resp.json());
    console.log("PULL detials", pullDetail);
    let wfs = await getGHApi(`repos/${repoInputValue}/actions/runs`, {head_sha: pullDetail.head.sha}).then(resp => resp.json());
    console.log("Workflows", wfs);

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
