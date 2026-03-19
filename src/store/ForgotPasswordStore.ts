import { makeAutoObservable, runInAction } from "mobx";
import { MetaModel } from "store/MetaModel";
import { forgotPassword } from "api/auth";

export class ForgotPasswordStore {
  email = "";

  readonly meta = new MetaModel();

  constructor(initial?: { email?: string }) {
    makeAutoObservable(this, {}, { autoBind: true });
    if (initial?.email) {
      this.email = initial.email;
    }
  }

  get canSubmit() {
    return !this.meta.loading && this.email.trim().length > 0;
  }

  setEmail(value: string) {
    this.email = value;
  }

  async submit(): Promise<void> {
    this.meta.start();
    try {
      await forgotPassword(this.email.trim());
      runInAction(() => {
        this.meta.finish();
      });
    } catch (e) {
      this.meta.fail(e);
    }
  }

  reset() {
    this.email = "";
    this.meta.reset();
  }
}

