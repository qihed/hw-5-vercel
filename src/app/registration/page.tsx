"use client";

import { useState } from "react";
import Link from "next/link";
import Text from "components/Text";
import Input from "components/Input";
import CheckBox from "components/CheckBox";
import Button from "components/Button";
import EyeIcon from "icons/EyeIcon";
import EyeOffIcon from "icons/EyeOffIcon";
import styles from "./registration-page.module.scss";
import { observer } from "mobx-react-lite";
import { RegistrationStore } from "store/RegistrationStore";
import { useStore } from "store/StoreContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const RegistrationPage = () => {
  const { auth, validation } = useStore();
  const [reg] = useState(() => new RegistrationStore());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const formKey = "registration";
  const confirmPasswordError = validation.getFieldError(formKey, "confirmPassword");

  const validate = () => {
    validation.clearForm(formKey);
    let ok = true;
    const username = reg.username.trim();
    const email = reg.email.trim();
    const phone = reg.phone.trim();

    if (!username) {
      validation.setFieldError(formKey, "username", "Username is required.");
      ok = false;
    }
    if (!email) {
      validation.setFieldError(formKey, "email", "Email is required.");
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validation.setFieldError(formKey, "email", "Enter a valid email.");
      ok = false;
    }
    if (!phone) {
      validation.setFieldError(formKey, "phone", "Phone is required.");
      ok = false;
    }
    if (!reg.password) {
      validation.setFieldError(formKey, "password", "Password is required.");
      ok = false;
    } else if (reg.password.length < 8) {
      validation.setFieldError(formKey, "password", "Password must be at least 8 characters.");
      ok = false;
    }
    if (!reg.confirmPassword) {
      validation.setFieldError(formKey, "confirmPassword", "Confirm your password.");
      ok = false;
    } else if (reg.password !== reg.confirmPassword) {
      validation.setFieldError(formKey, "confirmPassword", "Passwords do not match.");
      ok = false;
    }
    if (!reg.agreeTerms) {
      validation.setFieldError(formKey, "agreeTerms", "You must accept the terms to continue.");
      ok = false;
    }
    return ok;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await reg.registration();

    if (reg.meta.error) {
      validation.setFormError(formKey, "Registration failed. Please check your credentials.");
      toast.error("Registration failed. Please check your credentials.");
    } else {
      validation.clearForm(formKey);
      auth.setNickname(reg.username);
      auth.setProfileEmail(reg.email);
      auth.setPhone(reg.phone);
      auth.saveProfile();
      router.replace("/profile");
    }
  };

  const passwordToggle = (
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

  const confirmPasswordToggle = (
    <Button
      type="button"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      className={styles.togglePassword}
    >
      {showConfirmPassword ? (
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
              Create account
            </Text>
            <Text view="p-18" color="secondary">
              Join us and start shopping for the best furniture
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
              <label htmlFor="username" className={styles.label}>
                Username <span className={styles.required}>*</span>
              </label>
              <Input
                id="username"
                value={reg.username}
                onChange={(v) => {
                  validation.clearFieldError(formKey, "username");
                  validation.clearFormError(formKey);
                  reg.setUsername(v);
                }}
                placeholder="Enter your username"
                className={styles.input}
              />
              {validation.getFieldError(formKey, "username") && (
                <Text view="p-14" className={styles.errorText}>
                  {validation.getFieldError(formKey, "username")}
                </Text>
              )}
            </div>

            <div>
              <label htmlFor="email" className={styles.label}>
                Email <span className={styles.required}>*</span>
              </label>
              <Input
                id="email"
                type="email"
                value={reg.email}
                onChange={(v) => {
                  validation.clearFieldError(formKey, "email");
                  validation.clearFormError(formKey);
                  reg.setEmail(v);
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
              <label htmlFor="phone" className={styles.label}>
                Phone <span className={styles.required}>*</span>
              </label>
              <Input
                id="phone"
                type="tel"
                value={reg.phone}
                onChange={(v) => {
                  validation.clearFieldError(formKey, "phone");
                  validation.clearFormError(formKey);
                  reg.setPhone(v);
                }}
                placeholder="+7 (999) 999-99-99"
                className={styles.input}
              />
              {validation.getFieldError(formKey, "phone") && (
                <Text view="p-14" className={styles.errorText}>
                  {validation.getFieldError(formKey, "phone")}
                </Text>
              )}
            </div>

            <div>
              <label htmlFor="password" className={styles.label}>
                Password <span className={styles.required}>*</span>
              </label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={reg.password}
                onChange={(v) => {
                  validation.clearFieldError(formKey, "password");
                  validation.clearFormError(formKey);
                  reg.setPassword(v);
                }}
                placeholder="Minimum 8 characters"
                className={styles.input}
                afterSlot={passwordToggle}
              />
              {validation.getFieldError(formKey, "password") && (
                <Text view="p-14" className={styles.errorText}>
                  {validation.getFieldError(formKey, "password")}
                </Text>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm password <span className={styles.required}>*</span>
              </label>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={reg.confirmPassword}
                onChange={(v) => {
                  validation.clearFieldError(formKey, "confirmPassword");
                  validation.clearFormError(formKey);
                  reg.setConfirmPassword(v);
                }}
                placeholder="Repeat your password"
                className={[styles.input, confirmPasswordError ? styles.inputError : ""].filter(Boolean).join(" ")}
                afterSlot={confirmPasswordToggle}
              />
              {confirmPasswordError && (
                <Text view="p-14" className={styles.errorText}>
                  {confirmPasswordError}
                </Text>
              )}
            </div>

            <div className={styles.termsRow}>
              <div className={styles.checkboxBorder}>
                <CheckBox
                  checked={reg.agreeTerms}
                  onChange={(v) => {
                    validation.clearFieldError(formKey, "agreeTerms");
                    validation.clearFormError(formKey);
                    reg.setAgreeTerms(v);
                  }}
                  size={17}
                />
              </div>
              <Text view="p-14" tag="span" color="secondary">
                I agree to the{" "}
                <a href="#" className={styles.termsLink}>
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className={styles.termsLink}>
                  Privacy Policy
                </a>
              </Text>
            </div>
            {validation.getFieldError(formKey, "agreeTerms") && (
              <Text view="p-14" className={styles.errorText}>
                {validation.getFieldError(formKey, "agreeTerms")}
              </Text>
            )}

            <Button type="submit" className={styles.submitButton}>
              Register
            </Button>
            {validation.getFormError(formKey) && (
              <Text view="p-14" className={styles.errorText}>
                {validation.getFormError(formKey)}
              </Text>
            )}

            <Text view="p-14" color="secondary" className={styles.loginText}>
              Already have an account?{" "}
              <Link href="/login" className={styles.loginLink}>
                Log in
              </Link>
            </Text>
          </form>
        </div>
      </main>
    </div>
  );
};

export default observer(RegistrationPage);
