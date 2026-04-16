<template>
  <div>
    <!-- Header -->
    <div class="login-header">
      <h3 class="login-header__title">{{ t("login.welcomeBack") }}</h3>
      <p class="login-header__subtitle">{{ t("login.welcomeMessage") }}</p>
    </div>

    <el-form
      ref="loginFormRef"
      :model="loginFormData"
      :rules="loginRules"
      size="large"
      class="login-form"
    >
      <!-- Username -->
      <el-form-item prop="username">
        <el-input v-model.trim="loginFormData.username" :placeholder="t('login.username')">
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- Password -->
      <el-tooltip :visible="isCapsLock" :content="t('login.capsLock')" placement="right">
        <el-form-item prop="password">
          <el-input
            v-model.trim="loginFormData.password"
            :placeholder="t('login.password')"
            type="password"
            show-password
            @keyup="checkCapsLock"
            @keyup.enter="handleLoginSubmit"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-tooltip>

      <!-- Captcha -->
      <el-form-item prop="captchaCode">
        <div class="captcha-row">
          <el-input
            v-model.trim="loginFormData.captchaCode"
            :placeholder="t('login.captchaCode')"
            @keyup.enter="handleLoginSubmit"
          >
            <template #prefix>
              <div class="i-svg:captcha" />
            </template>
          </el-input>
          <div class="captcha-img" @click="getCaptcha">
            <el-icon v-if="codeLoading" class="is-loading"><Loading /></el-icon>
            <img v-else :src="captchaBase64" alt="captcha" />
          </div>
        </div>
      </el-form-item>

      <!-- Remember me & Forget password -->
      <div class="login-options">
        <el-checkbox v-model="loginFormData.rememberMe">{{ t("login.rememberMe") }}</el-checkbox>
        <el-link type="primary" underline="never" @click="toOtherForm('resetPwd')">
          {{ t("login.forgetPassword") }}
        </el-link>
      </div>

      <!-- Login button -->
      <el-form-item>
        <el-button :loading="loading" type="primary" class="login-btn" @click="handleLoginSubmit">
          {{ t("login.login") }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- Register link -->
    <div class="login-register">
      <el-text size="default">{{ t("login.noAccount") }}</el-text>
      <el-link type="primary" underline="never" @click="toOtherForm('register')">
        {{ t("login.reg") }}
      </el-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance } from "element-plus";
import { LocationQuery, RouteLocationRaw, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import AuthAPI, { type LoginFormData } from "@/api/auth.api";
import router from "@/router";
import { useUserStore } from "@/store";

const { t } = useI18n();
const userStore = useUserStore();
const route = useRoute();

onMounted(() => getCaptcha());

const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const isCapsLock = ref(false);
const captchaBase64 = ref();

const loginFormData = ref<LoginFormData>({
  username: "demo",
  password: "demo123",
  captchaKey: "",
  captchaCode: "",
  rememberMe: false,
});

const loginRules = computed(() => {
  return {
    username: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.username.required"),
      },
    ],
    password: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.password.required"),
      },
      {
        min: 6,
        message: t("login.message.password.min"),
        trigger: "blur",
      },
    ],
    captchaCode: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.captchaCode.required"),
      },
    ],
  };
});

// Get captcha
const codeLoading = ref(false);
function getCaptcha() {
  codeLoading.value = true;
  AuthAPI.getCaptcha()
    .then((data) => {
      loginFormData.value.captchaKey = data.captchaKey;
      captchaBase64.value = data.captchaBase64;
    })
    .finally(() => (codeLoading.value = false));
}

// Login submit handler
async function handleLoginSubmit() {
  try {
    const valid = await loginFormRef.value?.validate();
    if (!valid) return;

    loading.value = true;
    await userStore.login(loginFormData.value);
    await userStore.getUserInfo();

    const redirect = resolveRedirectTarget(route.query);
    await router.push(redirect);
  } catch (error) {
    getCaptcha();
    console.error("Login failed:", error);
  } finally {
    loading.value = false;
  }
}

function resolveRedirectTarget(query: LocationQuery): RouteLocationRaw {
  const defaultPath = "/";
  const rawRedirect = (query.redirect as string) || defaultPath;

  try {
    const resolved = router.resolve(rawRedirect);
    return {
      path: resolved.path,
      query: resolved.query,
    };
  } catch {
    return { path: defaultPath };
  }
}

// Check caps lock
function checkCapsLock(event: KeyboardEvent) {
  if (event instanceof KeyboardEvent) {
    isCapsLock.value = event.getModifierState("CapsLock");
  }
}

const emit = defineEmits(["update:modelValue"]);
function toOtherForm(type: "register" | "resetPwd") {
  emit("update:modelValue", type);
}
</script>

<style lang="scss" scoped>
/* ===== Header ===== */
.login-header {
  text-align: center;
  margin-bottom: 28px;

  &__title {
    margin: 0 0 6px;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.3px;
    color: var(--el-text-color-primary);
  }

  &__subtitle {
    margin: 0;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

/* ===== Form overrides ===== */
.login-form {
  :deep(.el-input__wrapper) {
    border-radius: 10px;
    padding: 4px 12px;
    transition: all 0.25s ease;
    background: rgba(255, 255, 255, 0.04);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08) inset;

    &:hover {
      box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25) inset;
    }

    &.is-focus {
      box-shadow:
        0 0 0 1px var(--el-color-primary) inset,
        0 0 12px rgba(59, 130, 246, 0.08);
    }
  }

  :deep(.el-input__inner) {
    height: 38px;
  }
}

/* ===== Captcha ===== */
.captcha-row {
  display: flex;
  width: 100%;
  gap: 10px;
}

.captcha-img {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 40px;
  cursor: pointer;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.25s ease;

  &:hover {
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.08);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

/* ===== Options row ===== */
.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
}

/* ===== Login button ===== */
.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);

  &:hover,
  &:focus {
    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
    box-shadow: 0 6px 24px rgba(59, 130, 246, 0.35);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  }
}

/* ===== Register link ===== */
.login-register {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* ===== Light theme overrides ===== */
html:not(.dark) {
  .login-form {
    :deep(.el-input__wrapper) {
      background: rgba(0, 0, 0, 0.02);
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08) inset;
    }
  }

  .captcha-img {
    border-color: rgba(0, 0, 0, 0.08);
  }
}
</style>
