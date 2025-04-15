<template>
  <div class="logo">
    <transition enter-active-class="animate__animated animate__fadeInLeft">
      <router-link :key="+collapse" class="wh-full flex-center" to="/">
        <div class="logo-icon">
          <div class="icon-wrapper">
            <el-icon class="icon-bg"><ShoppingBag /></el-icon>
            <el-icon class="icon-front"><ShoppingCart /></el-icon>
          </div>
        </div>
        <span v-if="!collapse" class="title">SmartRetail Pro</span>
      </router-link>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ShoppingBag, ShoppingCart } from "@element-plus/icons-vue";

defineProps({
  collapse: {
    type: Boolean,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.logo {
  width: 100%;
  height: $navbar-height;
  background-color: $sidebar-logo-background;
  overflow: hidden;

  .logo-icon {
    width: 32px;
    height: 32px;
    position: relative;

    .icon-wrapper {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-bg {
      position: absolute;
      font-size: 32px;
      color: var(--el-color-primary);
      opacity: 0.2;
      transform: scale(1.2);
    }

    .icon-front {
      position: relative;
      font-size: 20px;
      color: var(--el-color-primary);
      z-index: 1;
      filter: drop-shadow(0 2px 4px rgba(64, 158, 255, 0.2));
    }
  }

  .title {
    flex-shrink: 0;
    margin-left: 12px;
    font-size: 18px;
    font-weight: 600;
    color: $sidebar-logo-text-color;
    white-space: nowrap;
    background: linear-gradient(135deg, #409eff, #67c23a);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    letter-spacing: 0.5px;
  }

  &:hover {
    .icon-front {
      transform: scale(1.1);
      transition: transform 0.3s ease;
    }
    
    .icon-bg {
      transform: scale(1.3);
      transition: transform 0.3s ease;
    }
  }
}

.layout-top,
.layout-mix {
  .logo {
    width: $sidebar-width;
  }

  &.hideSidebar {
    .logo {
      width: $sidebar-width-collapsed;
    }
  }
}
</style>
