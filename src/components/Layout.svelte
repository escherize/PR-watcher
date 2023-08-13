<script>
  import { Content, Toggle, LocalStorage } from "carbon-components-svelte";
  let isWhiteTheme = true;
  $: document.documentElement.setAttribute("theme", isWhiteTheme ? "white" : "g100");

</script>

<LocalStorage key="theme-setting" bind:value={isWhiteTheme} />
<div id="layout">

  <Content>
    <div class="theme-toggled">
      <div style="margin-right: 23px;">
        <Toggle
          bind:toggled={isWhiteTheme}  labelA="🌓" labelB="🌓"/>
      </div>
    </div>

    <slot></slot>
  </Content>
</div>

<style>
  .theme-toggled {
    display: flex;
    justify-content: flex-end;
  }
</style>
