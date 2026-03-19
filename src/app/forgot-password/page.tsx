"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Text from "components/Text";
import Input from "components/Input";
import Button from "components/Button";
import styles from "./forgot-password-page.module.scss";
import { toast } from "sonner";
import { ForgotPasswordStore } from "store/ForgotPasswordStore";
import { observer } from "mobx-react-lite";
import { useStore } from "store/StoreContext";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [store] = useState(() => new ForgotPasswordStore());
  const { validation } = useStore();
  const formKey = "forgotPassword";

  const handleSubmit = async () => {
    validation.clearForm(formKey);
    const email = store.email.trim();
    if (!email) {
      validation.setFieldError(formKey, "email", "Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validation.setFieldError(formKey, "email", "Enter a valid email.");
      return;
    }
    if (!store.canSubmit) return;

    await store.submit();
    if (store.meta.error) {
      validation.setFormError(formKey, "Failed to send reset email. Please try again.");
      toast.error("Failed to send reset email. Please try again.");
      return;
    }
    validation.clearForm(formKey);
    toast.success("We sent a reset code to your email.");
    router.push(`/reset-password?email=${encodeURIComponent(store.email.trim())}`);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.headerSection}>
            <Text view="title" tag="h1" className={styles.title}>
              Forgot password
            </Text>
            <Text view="p-18" color="secondary">
              Enter your email and we’ll send you a reset code
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
                value={store.email}
                onChange={(v) => {
                  validation.clearFieldError(formKey, "email");
                  validation.clearFormError(formKey);
                  store.setEmail(v);
                }}
                placeholder="example@email.com"
                className={styles.input}
                autoComplete="email"
              />
              {validation.getFieldError(formKey, "email") && (
                <Text view="p-14" className={styles.errorText}>
                  {validation.getFieldError(formKey, "email")}
                </Text>
              )}
            </div>

            <Button type="submit" className={styles.submitButton} disabled={!store.canSubmit}>
              {store.meta.loading ? "Sending..." : "Send code"}
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

export default observer(ForgotPasswordPage);

