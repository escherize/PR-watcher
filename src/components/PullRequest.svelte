<script>
  //------------------------ props ------------------------//
  export let pull;

  //------------------------ states ------------------------//
</script>

<div class="pull-request">
  <a href={pull.html_url}>{pull.title}</a>
</div>


<style lang="scss">
  a {
    color: red;
    text-decoration: none;
  }
</style>
