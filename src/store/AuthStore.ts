import { makeAutoObservable, runInAction } from 'mobx';
import { MetaModel } from 'store/MetaModel';
import { LocalStorageModel } from 'store/LocalStorageModel';
import { PROFILE_KEY } from 'config/storage';
import { login, logout as apiLogout, getToken, getStoredUser } from 'api/auth';

type ProfileData = {
  nickname: string;
  email: string;
  phone: string;
  address: string;
};

export class AuthStore {
  email = '';
  password = '';
  rememberMe = false;
  readonly meta = new MetaModel();
  user: string | null = null;

  nickname = '';
  profileEmail = '';
  phone = '';
  address = '';

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    const saved = LocalStorageModel.getItemJson<ProfileData | null>(PROFILE_KEY, null);
    if (saved) {
      this.nickname = saved.nickname;
      this.profileEmail = saved.email;
      this.phone = saved.phone;
      this.address = saved.address;
    }
  }

  restoreAuth() {
    const token = getToken();
    const user = getStoredUser();
    if (token && user) {
      this.user = user;
    }
  }

  get isAuth() {
    return this.user !== null;
  }

  setEmail(value: string) { this.email = value; }
  setPassword(value: string) { this.password = value; }
  setRememberMe(value: boolean) { this.rememberMe = value; }

  setNickname(value: string) { this.nickname = value; }
  setProfileEmail(value: string) { this.profileEmail = value; }
  setPhone(value: string) { this.phone = value; }
  setAddress(value: string) { this.address = value; }

  saveProfile() {
    LocalStorageModel.setItemJson<ProfileData>(PROFILE_KEY, {
      nickname: this.nickname,
      email: this.profileEmail,
      phone: this.phone,
      address: this.address,
    });
  }

  async login() {
    this.meta.start();
    try {
      const user = await login(this.email, this.password);
      runInAction(() => {
        this.user = user.username;
        if (!this.nickname) {
          this.nickname = user.username;
        }
        if (!this.profileEmail) {
          this.profileEmail = this.email;
        }
        this.saveProfile();
        this.meta.finish();
      });
    } catch (e) {
      this.meta.fail(e);
    }
  }

  async logout() {
    await apiLogout();
    runInAction(() => {
      this.user = null;
      this.email = '';
      this.password = '';
      this.rememberMe = false;
      this.nickname = '';
      this.profileEmail = '';
      this.phone = '';
      this.address = '';
      this.meta.reset();
    });
  }

  reset() {
    this.email = '';
    this.password = '';
    this.rememberMe = false;
    this.meta.reset();
    this.user = null;
  }
}
