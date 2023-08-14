<script>
  import { onMount } from "svelte";
  import { Button, CopyButton, Toggle } from "carbon-components-svelte";
  import Reset from "carbon-icons-svelte/lib/Reset.svelte";

  import { getGHApi, postGHApi } from "@/lib/api";

  // Atanomy of a PR's action
  // PR => Workflow Runs => Workflow Jobs
  //------------------------ props ------------------------//
  export let repo;
  export let pull;
  export let watch;
  export let onToggleWatch;
  export let watchInterval;

  const JOB_STATUS_TO_TITLE = {
    "skipped": "skipped",
    "success": "successful",
    "failure": "failing checks",
    "cancelled": "cancelled",
    "action_required": "required actions",
    "timed_out": "timed out",
    "neutral": "neutral",
    "stale": "staled",
    "startup_failure": "failed to start",
    null: "in progress"
  };

  const FAILED_STATUES = ["failure", "cancelled", "timed_out", "startup_failure"];

  //------------------------ states ------------------------//
  let workflowRuns = [];
  let workflowJobs = [];
  let pullDetail = null;
  let statusMap = {};
  let watchIntervalHandler = null;
  let showJobsDetailByStatus = null; // "failure" | "sucecss" | etc

  async function rerunFailedRun(runId) {
    postGHApi(`repos/${repo}/actions/runs/${runId}/rerun-failed-jobs`)
      .then(resp => {
        // update so that the status text reflect this
        workflowJobs = workflowJobs.map(job => {
          if (job.run_id == runId && FAILED_STATUES.includes(job.conclusion)) {
            job.status = "queued";
            job.conclusion = null;
          }
          return job
        });
        window.jobs = workflowJobs;
      });
  }

  function rerunFailedJobs(jobs) {
    const failedJobs = jobs.filter(job => FAILED_STATUES.includes(job.conclusion));
    // This is a bit weird, to re-run a failed job, we just need to provide one run-id
    // in that job, not the job_id itself
    const failedRuns = new Set(failedJobs.map(job => job.run_id));
    failedRuns.forEach(runId => rerunFailedRun(runId));
  }

  function refreshJobs(runs) {
    if (runs.length > 0) {
      Promise.all(workflowRuns.map(run => {
        return getGHApi(run.jobs_url)
          .then(resp => resp.json())
          .then(data => data.jobs);
      })).then(values => {
        workflowJobs = values.flat(1)
        return workflowJobs});
    }
  }

  function refreshRuns(pull) {
    getGHApi(`repos/${repo}/actions/runs`, {event: "pull_request", branch: pull.head.ref, head_sha: pull.head.sha})
      .then(resp => resp.json())
      .then(data => {
        workflowRuns = data.workflow_runs
        return workflowRuns
      })
      .then(runs => refreshJobs(runs));
  }


  function refreshPullDetail(pull_request_url) {
    getGHApi(pull_request_url)
      .then(resp => resp.json())
      .then(data => {
        pullDetail = data
        return pullDetail
      })
      .then(pullDetail => {
        // fetch the workflow runs then refresh jobs
        refreshRuns(pullDetail);
      });
  }

  function onClickStatus(status) {
    if (showJobsDetailByStatus == status) showJobsDetailByStatus = null
    else showJobsDetailByStatus = status
  }


  onMount(() => {
    refreshPullDetail(pull.pull_request.url);
  })

  $: if (watch && watchInterval) {
    if (watchIntervalHandler) clearInterval(watchIntervalHandler);
    watchIntervalHandler = setInterval(() => {
      refreshPullDetail(pull.pull_request.url);
    }, watchInterval);
  }

  $ : {
    statusMap = workflowJobs.map(job => job.conclusion).reduce(function (acc, curr) {
      return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
    }, {});}

</script>

<div class="pull-request">
  <div class="info-and-title">
    <div class="info">
      <a class="title" href={pull.html_url}>{pull.title} #{pull.number}</a>
      {#each [...Object.entries(statusMap).entries()] as [index, [status, count]]}
        <span class="status" on:click={() => onClickStatus(status)}>{count} {JOB_STATUS_TO_TITLE[status]}</span>
        {#if (index != Object.keys(statusMap).length - 1 )}
          <span>,&nbsp;</span>
        {/if}
      {/each}
    </div>
    <div class="actions">
      {#if pullDetail}
        <div class="action-item copy-branch">
          <p>{pullDetail.head.ref}</p>
          <div class="action-item">
            <CopyButton text={pullDetail.head.ref}/>
          </div>
        </div>
      {/if}

      <div class="action-item">
        <Button iconDescription="Refresh" on:click={() => refreshPullDetail(pull.pull_request.url)} icon={Reset}/>
      </div>


      <div class="action-item">
        <Button
          on:click={() => rerunFailedJobs(workflowJobs)}
          disabled={!Object.keys(statusMap).some((status) => FAILED_STATUES.includes(status))}>Re-run failed jobs</Button>
      </div>

      <div class="action-item">
        <Toggle
          bind:toggled={watch}
          on:toggle={(e) => {
          if (onToggleWatch) {
          onToggleWatch(e.detail.toggled, pull.id);
          watch = e.detail.toggled;
          }}}
          labelText="Watch" labelA="" labelB=""/>
      </div>

    </div>
  </div>
  <div class="job-details">
    {#if showJobsDetailByStatus}
      <p on:click={() => { showJobsDetailByStatus = null }}>Hide jobs</p>
      {#each workflowJobs.filter(job => job.conclusion == showJobsDetailByStatus) as job}
        <a href={job.html_url}>{job.name}</a>
      {/each}
    {/if}
  </div>

</div>

<style lang="scss">
  .pull-request {
    border-bottom: 1px solid #e1e4e8;
      .info-and-title {
        display: flex;
        justify-content: space-between;
          .info {
            padding-top: 10px;
            padding-bottom: 10px;
              .title {
                display: block;
                font-size: 1.15em;
                margin-bottom: 5px;
                text-decoration: none;
              }
              .status  {
                font-size: 0.95em;
              }
          }
          .actions {
            display: flex;
            align-items: center;
              p {
                cursor: pointer;
              }

          }
      }
      .job-details {
        padding-top: 20px;
          a {
            display: block;
            line-height: 1.4em;
            text-decoration: none;
          }
      }
  }

  .action-item {
    margin-left: 10px;
  }
  .copy-branch {
    display: flex;
      button {
        padding-left: 20px;
      }
  }
</style>
