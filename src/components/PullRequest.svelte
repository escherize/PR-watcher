<script>
  import { onMount } from "svelte";

  import { getGHApi } from "@/lib/api";
  //------------------------ props ------------------------//
  export let repo;
  export let pull;

  //------------------------ states ------------------------//
  let workflowRuns = [];
  let workflowJobs = [];
  let pullDetail = null;
  let statusMap = {};

  const jobStatuses =
    [
      ["skipped", "skipped"],
      ["success", "successful"],
      ["failure", "failing checks"],
      ["cancelled", "cancelled"],
      ["action_required", "required actions"],
      ["timed_out", "timed out"],
      ["neutral", "neutral"],
      ["stale", "staled"],
      ["startup_failure", "failed to start"],
    ]

  function statusToTitle(status) {
    return status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
  }

  // everytime the detail gets updated, we need to fetch the workflow runs
  $ : if (pullDetail) {
    getGHApi(`repos/${repo}/actions/runs`, {event: "pull_request", branch: pullDetail.head.ref})
      .then(resp => resp.json())
      .then(data => {
        workflowRuns = data.workflow_runs
        //console.log("workflow runs", workflowRuns);
      });
  }

  $: if (workflowRuns.length > 0) {
    Promise.all(workflowRuns.map(run => {
      return getGHApi(run.jobs_url)
        .then(resp => resp.json())
        .then(data => {
          return data.jobs
        });
    })).then(values => workflowJobs = values.flat(1));
  }

  $: {
    statusMap = workflowJobs.map(job => job.conclusion).reduce(function (acc, curr) {
      return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
    }, {});
    console.log("statusMap", statusMap);
  }

  onMount(() => {
    getGHApi(pull.pull_request.url)
      .then(resp => resp.json())
      .then(data => pullDetail = data);
  })
  $ : console.log("workflowjobs", workflowJobs);

</script>

<div class="pull-request">
  <a href={pull.html_url}>{pull.title}</a>

  {#each jobStatuses as [status, title]}
    {#if statusMap[status] > 0 }
      <span class="status" title={statusToTitle(status)}>{statusMap[status]} {title}</span>
    {/if}
  {/each}
</div>

<style lang="scss">
  a {
    color: #3d70b2;
    text-decoration: none;
  }
</style>
