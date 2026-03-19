"use client";

import { useState } from "react";
import Link from "next/link";
import Text from "components/Text";
import Input from "components/Input";
import CheckBox from "components/CheckBox";
import Button from "components/Button";
import EyeIcon from "icons/EyeIcon";
import EyeOffIcon from "icons/EyeOffIcon";
import styles from "./login-page.module.scss";
import { useStore } from "store/StoreContext";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const LoginPage = () => {
  const { auth, validation } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const formKey = "login";

  const handleSubmit = async () => {
    validation.clearForm(formKey);
    const email = auth.email.trim();
    const password = auth.password;
    let ok = true;
    if (!email) {
      validation.setFieldError(formKey, "email", "Email is required.");
      ok = false;
    }
    if (!password) {
      validation.setFieldError(formKey, "password", "Password is required.");
      ok = false;
    }
    if (!ok) return;

    await auth.login();

    if (auth.meta.error) {
      validation.setFormError(formKey, "Login failed. Please check your credentials.");
      toast.error("Login failed. Please check your credentials.");
    } else {
      validation.clearForm(formKey);
      router.replace("/products");
    }
  };

  const eyeToggle = (
    <Button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className={styles.togglePassword}
    >
      {showPassword ? (
        <EyeOffIcon width={20} height={20} />
      ) : (
        <EyeIcon width={20} height={20} />
      )}
    </Button>
  );

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.headerSection}>
            <Text view="title" tag="h1" className={styles.title}>
              Welcome
            </Text>
            <Text view="p-18" color="secondary">
              Log in your account to continue
            </Text>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className={styles.form}
          >
            <div>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={auth.email}
                onChange={(v) => {
                  validation.clearFieldError(formKey, "email");
                  validation.clearFormError(formKey);
                  auth.setEmail(v);
                }}
                placeholder="example@email.com"
                className={styles.input}
              />
              {validation.getFieldError(formKey, "email") && (
                <Text view="p-14" className={styles.errorText}>
                  {validation.getFieldError(formKey, "email")}
                </Text>
              )}
            </div>

            <div>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={auth.password}
                onChange={(v) => {
                  validation.clearFieldError(formKey, "password");
                  validation.clearFormError(formKey);
                  auth.setPassword(v);
                }}
                placeholder="Your password"
                className={styles.input}
                afterSlot={eyeToggle}
              />
              {validation.getFieldError(formKey, "password") && (
                <Text view="p-14" className={styles.errorText}>
                  {validation.getFieldError(formKey, "password")}
                </Text>
              )}
            </div>

            <div className={styles.rememberRow}>
              <div className={styles.rememberGroup}>
                <CheckBox
                  checked={auth.rememberMe}
                  onChange={auth.setRememberMe}
                  size={17}
                />
                <Text view="p-14" tag="span" color="secondary">
                  Remember me
                </Text>
              </div>
              <Link href="/forgot-password" className={styles.forgotLink}>
                Forgot your password?
              </Link>
            </div>

            <Button type="submit" className={styles.submitButton}>
              Log in
            </Button>
            {validation.getFormError(formKey) && (
              <Text view="p-14" className={styles.errorText}>
                {validation.getFormError(formKey)}
              </Text>
            )}

            <Text view="p-14" color="secondary" className={styles.registerText}>
              No account?{" "}
              <Link href="/registration" className={styles.registerLink}>
                Register
              </Link>
            </Text>
          </form>

          <div className={styles.divider}>
            <div className={styles.dividerLine}>
              <div className={styles.dividerBorder} />
            </div>
            <div className={styles.dividerText}>
              <Text view="p-14" tag="span" color="secondary">
                or
              </Text>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default observer(LoginPage);
