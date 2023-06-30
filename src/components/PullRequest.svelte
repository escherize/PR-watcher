<script>
  import { onMount } from "svelte";
  import { Button, Toggle } from "carbon-components-svelte";

  import { getGHApi, postGHApi } from "@/lib/api";

  // Atanomy of a PR's action
  // PR => Workflow Runs => Workflow Jobs
  //------------------------ props ------------------------//
  export let repo;
  export let pull;
  export let watch = false;

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
      [null, "in progress"]
    ]

  const failedStatuses = ["failure", "cancelled", "timed_out", "startup_failure"];

  //------------------------ states ------------------------//
  let workflowRuns = [];
  let workflowJobs = [];
  let pullDetail = null;
  let statusMap = {};
  let statusText = "";

  async function  rerunFailedJob(runId) {
    // This is a bit weird, to re-run a failed job, we just need to provide one run-id
    // in that job, not the job_id itself
    await postGHApi(`repos/${repo}/actions/runs/${runId}/rerun-failed-jobs`);
    // update so that the status text reflect this
    workflowJobs = workflowJobs.map(job => {
      if (job.run_id == runId && failedStatuses.includes(job.conclusion)) {
        job.status = "queued";
        job.conclusion = null;
      }
      return job;
    });
  }

  function rerunFailedJobs() {
    const failedJobs = workflowJobs.filter(job => failedStatuses.includes(job.conclusion));
    const failedRuns = new Set(failedJobs.map(job => job.run_id));
    console.log("failed runs", failedRuns);
    failedRuns.forEach(runId => rerunFailedJob(runId));
  }

  // everytime the detail gets updated, we need to fetch the workflow runs
  $ : if (pullDetail) {
    getGHApi(`repos/${repo}/actions/runs`, {event: "pull_request", branch: pullDetail.head.ref})
      .then(resp => resp.json())
      .then(data => workflowRuns = data.workflow_runs);
  }

  // fetch the jobs everytime workflow runs get updated
  $: if (workflowRuns.length > 0) {
    Promise.all(workflowRuns.map(run => {
      return getGHApi(run.jobs_url)
        .then(resp => resp.json())
        .then(data => data.jobs);
    })).then(values => workflowJobs = values.flat(1));
  }

  // update status map and status title evertime jobs get updated
  $: {
    statusMap = workflowJobs.map(job => job.conclusion).reduce(function (acc, curr) {
      return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
    }, {});
    statusText = jobStatuses.map(jobStatus => {
      let [status, title] = jobStatus
      if (statusMap[status] > 0 ) {
        return `${statusMap[status]} ${title}`
      }
    }).filter(Boolean).join(", ");
  }

  onMount(() => {
    getGHApi(pull.pull_request.url)
      .then(resp => resp.json())
      .then(data => pullDetail = data);
  })

</script>

<div class="pull-request">
  <div class="info">
    <a class="title" href={pull.html_url}>{pull.title}</a>
    <p class="status" >{statusText}</p>
  </div>

  <div class="actions">
    <Toggle class="action-item" labelText="Watch" labelA="" labelB=""/>
    <Button
      class="action-item"
      on:click={() => rerunFailedJobs()}
      disabled={!Object.keys(statusMap).some((status) => failedStatuses.includes(status))}>Re-run failed jobs</Button>
  </div>
</div>

<style lang="scss">
  .pull-request {
    display: flex;
    border-bottom: 1px solid #e1e4e8;
    justify-content: space-between;
      .info {
        padding: 10px;
          .title {
            display: block;
            font-size: 1.15em;
            color: #3d70b2;
            margin-bottom: 5px;
            text-decoration: none;
          }
          .status  {
            font-size: 0.95em;
            color: #586069;
          }
      }
      .actions {
        display: flex;
        align-items: center;
          p {
            color: #3d70b2;
            cursor: pointer;
          }
          .action-item {
            padding-left: 10px;
          }

      }
  }
</style>
