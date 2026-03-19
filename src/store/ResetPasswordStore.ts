import { makeAutoObservable, runInAction } from "mobx";
import { MetaModel } from "store/MetaModel";
import { resetPassword } from "api/auth";

export class ResetPasswordStore {
  code = "";
  password = "";
  confirmPassword = "";

  readonly meta = new MetaModel();

  constructor(initial?: { code?: string }) {
    makeAutoObservable(this, {}, { autoBind: true });
    if (initial?.code) {
      this.code = initial.code;
    }
  }

  get passwordsMatch() {
    return this.password.length > 0 && this.password === this.confirmPassword;
  }

  get canSubmit() {
    return (
      !this.meta.loading &&
      this.code.trim().length > 0 &&
      this.password.length > 0 &&
      this.confirmPassword.length > 0 &&
      this.passwordsMatch
    );
  }

  setCode(value: string) {
    this.code = value;
  }
  setPassword(value: string) {
    this.password = value;
  }
  setConfirmPassword(value: string) {
    this.confirmPassword = value;
  }

  async submit(): Promise<void> {
    this.meta.start();
    try {
      await resetPassword({
        code: this.code.trim(),
        password: this.password,
        passwordConfirmation: this.confirmPassword,
      });
      runInAction(() => {
        this.meta.finish();
      });
    } catch (e) {
      this.meta.fail(e);
    }
  }

  reset() {
    this.code = "";
    this.password = "";
    this.confirmPassword = "";
    this.meta.reset();
  }
}

