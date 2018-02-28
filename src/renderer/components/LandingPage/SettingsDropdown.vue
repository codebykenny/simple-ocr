<template>
  <div class="settings-dropdown">
      <button @click="changeMode('normal')" :class="{'active': mode == 'normal'}" class="item"><i class="fas fa-align-left"></i> Normal</button>
      <button @click="changeMode('block')" :class="{'active': mode == 'block'}" class="item"><i class="fas fa-align-justify"></i> Block</button>
      <button @click="changeMode('paragraph')" :class="{'active': mode == 'paragraph'}" class="item"><i class="fas fa-paragraph"></i> Paragraph</button>
  </div>
</template>

<script>
export default {
    props: ['mode', 'changeMode']
}
</script>

<style>
    .settings-dropdown {
        background: #1b2329;
        border: 1px solid #272e35;
        width: 100px;
        height: 100px;
        padding: 10px;
        border-radius: 5px;
        position: absolute;
        top: 30px;
        right: 10px;
        z-index: 2;
        box-shadow: 0px 2px 2px 2px rgba(0,0,0,0.22);
    }

    .settings-dropdown .item {
        border: none;
        background: transparent;
        text-align: left;
        font-weight: 400;
        width: 100px;
        padding: 7px 5px;
        font-size: 13px;
        color: white;
        border-bottom: 1px solid #272e35;
        transition: all 0.25s ease;
        border-radius: 5px;
    }

    .settings-dropdown .item:focus {
        outline: none;
    }

    .settings-dropdown .item:hover {
        background: #242e35;
    }

    .settings-dropdown .item.active {
        background: #242e35;
    }

    .settings-dropdown .item svg {
        margin-right: 4px;
    }
</style>
