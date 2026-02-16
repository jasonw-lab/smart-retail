<template>
  <div class="login-page">
    <!-- Animated background -->
    <div class="login-bg">
      <div class="login-bg__gradient"></div>
      <div class="login-bg__orb login-bg__orb--1"></div>
      <div class="login-bg__orb login-bg__orb--2"></div>
      <div class="login-bg__orb login-bg__orb--3"></div>
      <div class="login-bg__grid"></div>
    </div>

    <!-- Top-right controls -->
    <div class="login-controls">
      <el-tooltip :content="t('login.themeToggle')" placement="left">
        <CommonWrapper>
          <DarkModeSwitch />
        </CommonWrapper>
      </el-tooltip>
      <el-tooltip :content="t('login.languageToggle')" placement="left">
        <CommonWrapper>
          <LangSelect size="text-20px" />
        </CommonWrapper>
      </el-tooltip>
    </div>

    <!-- Main content -->
    <div class="login-container">
      <!-- Left branding panel (hidden on mobile) -->
      <div class="login-branding">
        <div class="login-branding__content">
          <div class="login-branding__logo-area">
            <el-image :src="smartRetailLogo" class="login-branding__logo-img" />
            <h1 class="login-branding__title">Smart Retail Pro</h1>
          </div>
          <p class="login-branding__tagline">{{ t("login.welcomeMessage") }}</p>
          <div class="login-branding__features">
            <div class="login-branding__feature">
              <div class="login-branding__feature-icon">
                <el-icon :size="20"><DataAnalysis /></el-icon>
              </div>
              <span>Real-time Analytics</span>
            </div>
            <div class="login-branding__feature">
              <div class="login-branding__feature-icon">
                <el-icon :size="20"><ShoppingCart /></el-icon>
              </div>
              <span>Inventory Management</span>
            </div>
            <div class="login-branding__feature">
              <div class="login-branding__feature-icon">
                <el-icon :size="20"><TrendCharts /></el-icon>
              </div>
              <span>Sales Insights</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right form panel -->
      <div class="login-card">
        <div class="login-card__inner">
          <!-- Mobile logo -->
          <div class="login-card__mobile-logo">
            <el-image :src="smartRetailLogo" style="width: 56px" />
            <span class="login-card__mobile-title">Smart Retail Pro</span>
          </div>

          <!-- Form area with transition -->
          <transition name="fade-slide" mode="out-in">
            <component
              :is="formComponents[component]"
              v-model="component"
              class="login-card__form"
            />
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import smartRetailLogo from "@/assets/smartretail-logo.svg";
import CommonWrapper from "@/components/CommonWrapper/index.vue";
import DarkModeSwitch from "@/components/DarkModeSwitch/index.vue";
import { DataAnalysis, ShoppingCart, TrendCharts } from "@element-plus/icons-vue";

type LayoutMap = "login" | "register" | "resetPwd";

const t = useI18n().t;

const component = ref<LayoutMap>("login");
const formComponents = {
  login: defineAsyncComponent(() => import("./components/Login.vue")),
  register: defineAsyncComponent(() => import("./components/Register.vue")),
  resetPwd: defineAsyncComponent(() => import("./components/ResetPwd.vue")),
};
</script>

<style lang="scss" scoped>
/* ===== Page layout ===== */
.login-page {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family:
    "Inter",
    "Noto Sans JP",
    "Noto Sans SC",
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

/* ===== Animated background ===== */
.login-bg {
  position: absolute;
  inset: 0;
  z-index: 0;

  &__gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  }

  &__orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
    animation: float 20s ease-in-out infinite;

    &--1 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.35), transparent 70%);
      top: -10%;
      left: -5%;
      animation-delay: 0s;
    }

    &--2 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent 70%);
      bottom: -10%;
      right: -5%;
      animation-delay: -7s;
    }

    &--3 {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.25), transparent 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: -14s;
    }
  }

  &__grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 60px 60px;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.05);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.95);
  }
}

/* ===== Top-right controls ===== */
.login-controls {
  position: fixed;
  top: 28px;
  right: 28px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;

  :deep(.common-wrapper) {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    border-radius: 10px;
    padding: 6px;
    transition: all 0.25s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: scale(1.08);
    }
  }
}

/* ===== Main container ===== */
.login-container {
  position: relative;
  z-index: 10;
  display: flex;
  width: 940px;
  max-width: 95vw;
  min-height: 580px;
  border-radius: 24px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 25px 50px -12px rgba(0, 0, 0, 0.4),
    0 0 80px rgba(59, 130, 246, 0.06);
}

/* ===== Left branding panel ===== */
.login-branding {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: linear-gradient(160deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -60px;
    right: -60px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent 70%);
  }

  &__content {
    position: relative;
    z-index: 2;
    text-align: left;
  }

  &__logo-area {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }

  &__logo-img {
    width: 52px;
    height: 52px;
    filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3));
  }

  &__title {
    font-size: 28px;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.5px;
    margin: 0;
    background: linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &__tagline {
    font-size: 15px;
    color: rgba(148, 163, 184, 0.85);
    margin: 0 0 36px;
    line-height: 1.6;
  }

  &__features {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__feature {
    display: flex;
    align-items: center;
    gap: 14px;
    color: rgba(203, 213, 225, 0.8);
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.2px;
    transition: all 0.25s ease;

    &:hover {
      color: rgba(241, 245, 249, 0.95);
      transform: translateX(4px);
    }
  }

  &__feature-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(59, 130, 246, 0.12);
    border: 1px solid rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    flex-shrink: 0;
    transition: all 0.25s ease;

    .login-branding__feature:hover & {
      background: rgba(59, 130, 246, 0.2);
      border-color: rgba(59, 130, 246, 0.35);
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
    }
  }
}

/* ===== Right form panel ===== */
.login-card {
  width: 440px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  background: rgba(15, 23, 42, 0.6);

  &__inner {
    width: 100%;
    max-width: 340px;
  }

  &__mobile-logo {
    display: none;
    align-items: center;
    gap: 12px;
    margin-bottom: 32px;
    justify-content: center;
  }

  &__mobile-title {
    font-size: 22px;
    font-weight: 700;
    background: linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &__form {
    width: 100%;
  }
}

/* ===== Fade-slide transition ===== */
.fade-slide-leave-active,
.fade-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-24px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

/* ===== Light theme overrides ===== */
html:not(.dark) {
  .login-bg__gradient {
    background: linear-gradient(135deg, #f0f4ff 0%, #e8ecf4 50%, #f0f4ff 100%);
  }

  .login-bg__orb--1 {
    background: radial-gradient(circle, rgba(59, 130, 246, 0.12), transparent 70%);
  }

  .login-bg__orb--2 {
    background: radial-gradient(circle, rgba(139, 92, 246, 0.1), transparent 70%);
  }

  .login-bg__orb--3 {
    background: radial-gradient(circle, rgba(16, 185, 129, 0.08), transparent 70%);
  }

  .login-bg__grid {
    background-image:
      linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  }

  .login-container {
    background: rgba(255, 255, 255, 0.7);
    border-color: rgba(0, 0, 0, 0.06);
    box-shadow:
      0 25px 50px -12px rgba(0, 0, 0, 0.12),
      0 0 80px rgba(59, 130, 246, 0.04);
  }

  .login-branding {
    background: linear-gradient(160deg, rgba(59, 130, 246, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%);
    border-right-color: rgba(0, 0, 0, 0.06);

    &__title {
      background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
      background-clip: text;
      -webkit-background-clip: text;
    }

    &__tagline {
      color: rgba(71, 85, 105, 0.85);
    }

    &__feature {
      color: rgba(71, 85, 105, 0.8);

      &:hover {
        color: rgba(30, 41, 59, 0.95);
      }
    }

    &__feature-icon {
      background: rgba(59, 130, 246, 0.08);
      border-color: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
    }
  }

  .login-card {
    background: rgba(255, 255, 255, 0.5);

    &__mobile-title {
      background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
      background-clip: text;
      -webkit-background-clip: text;
    }
  }

  .login-controls {
    :deep(.common-wrapper) {
      background: rgba(0, 0, 0, 0.04);

      &:hover {
        background: rgba(0, 0, 0, 0.08);
      }
    }
  }
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    width: 92vw;
    max-width: 420px;
    min-height: auto;
    border-radius: 20px;
  }

  .login-branding {
    display: none;
  }

  .login-card {
    width: 100%;
    padding: 36px 28px;

    &__mobile-logo {
      display: flex;
    }
  }
}
</style>
