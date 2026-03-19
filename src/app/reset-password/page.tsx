"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Text from "components/Text";
import Input from "components/Input";
import Button from "components/Button";
import EyeIcon from "icons/EyeIcon";
import EyeOffIcon from "icons/EyeOffIcon";
import styles from "./reset-password-page.module.scss";
import { toast } from "sonner";
import { ResetPasswordStore } from "store/ResetPasswordStore";
import { observer } from "mobx-react-lite";
import { useStore } from "store/StoreContext";

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") ?? "";

  const [store] = useState(() => new ResetPasswordStore({ code: initialCode }));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { validation } = useStore();
  const formKey = "resetPassword";

  const passwordToggle = (
    <Button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      className={styles.togglePassword}
    >
      {showPassword ? <EyeOffIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
    </Button>
  );

  const confirmPasswordToggle = (
    <Button
      type="button"
      onClick={() => setShowConfirmPassword((v) => !v)}
      className={styles.togglePassword}
    >
      {showConfirmPassword ? (
        <EyeOffIcon width={20} height={20} />
      ) : (
        <EyeIcon width={20} height={20} />
      )}
    </Button>
  );

  const handleSubmit = async () => {
    validation.clearForm(formKey);
    const code = store.code.trim();
    if (!code) {
      validation.setFieldError(formKey, "code", "Enter the code from your email.");
      return;
    }
    if (!store.password) {
      validation.setFieldError(formKey, "password", "Enter your new password.");
      return;
    }
    if (store.password.length < 8) {
      validation.setFieldError(formKey, "password", "Password must be at least 8 characters.");
      return;
    }
    if (!store.confirmPassword) {
      validation.setFieldError(formKey, "confirmPassword", "Confirm your new password.");
      return;
    }
    if (!store.passwordsMatch) {
      validation.setFieldError(formKey, "confirmPassword", "Passwords do not match.");
      return;
    }

    await store.submit();
    if (store.meta.error) {
      validation.setFormError(formKey, "Failed to reset password. Please check the code and try again.");
      toast.error("Failed to reset password. Please check the code and try again.");
      return;
    }
    validation.clearForm(formKey);
    toast.success("Password updated. You can log in now.");
    router.replace("/login");
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.headerSection}>
            <Text view="title" tag="h1" className={styles.title}>
              Reset password
            </Text>
            <Text view="p-18" color="secondary">
              Enter the code from email and choose a new password
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
              <label htmlFor="code" className={styles.label}>
                Code
              </label>
              <Input
                id="code"
                value={store.code}
                onChange={(v) => {
                  validation.clearFieldError(formKey, "code");
                  validation.clearFormError(formKey);
                  store.setCode(v);
                }}
                placeholder="Enter code from email"
                className={styles.input}
                autoComplete="one-time-code"
              />
              {validation.getFieldError(formKey, "code") && (
                <Text view="p-14" className={styles.errorText}>
                  {validation.getFieldError(formKey, "code")}
                </Text>
              )}
            </div>

            <div>
              <label htmlFor="password" className={styles.label}>
                New password
              </label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={store.password}
                onChange={(v) => {
                  validation.clearFieldError(formKey, "password");
                  validation.clearFormError(formKey);
                  store.setPassword(v);
                }}
                placeholder="Minimum 8 characters"
                className={styles.input}
                afterSlot={passwordToggle}
                autoComplete="new-password"
              />
              {validation.getFieldError(formKey, "password") && (
                <Text view="p-14" className={styles.errorText}>
                  {validation.getFieldError(formKey, "password")}
                </Text>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm password
              </label>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={store.confirmPassword}
                onChange={(v) => {
                  validation.clearFieldError(formKey, "confirmPassword");
                  validation.clearFormError(formKey);
                  store.setConfirmPassword(v);
                }}
                placeholder="Repeat your new password"
                className={styles.input}
                afterSlot={confirmPasswordToggle}
                autoComplete="new-password"
              />
              {validation.getFieldError(formKey, "confirmPassword") && (
                <Text view="p-14" className={styles.errorText}>
                  {validation.getFieldError(formKey, "confirmPassword")}
                </Text>
              )}
            </div>

            <Button type="submit" className={styles.submitButton} disabled={!store.canSubmit}>
              {store.meta.loading ? "Updating..." : "Reset password"}
            </Button>
            {validation.getFormError(formKey) && (
              <Text view="p-14" className={styles.errorText}>
                {validation.getFormError(formKey)}
              </Text>
            )}

            <Link href="/login" className={styles.backLink}>
              Back to login
            </Link>
          </form>
        </div>
      </main>
    </div>
  );
};

export default observer(ResetPasswordPage);

