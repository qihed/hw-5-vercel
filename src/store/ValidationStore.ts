import { makeAutoObservable } from 'mobx';

type FormKey = string;
type FieldKey = string;

type FormErrors = {
  formError: string | null;
  fields: Map<FieldKey, string>;
};

export class ValidationStore {
  private readonly forms = new Map<FormKey, FormErrors>();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  private getOrCreateForm(form: FormKey): FormErrors {
    const existing = this.forms.get(form);
    if (existing) return existing;
    const created: FormErrors = { formError: null, fields: new Map() };
    this.forms.set(form, created);
    return created;
  }

  getFieldError(form: FormKey, field: FieldKey): string | null {
    return this.forms.get(form)?.fields.get(field) ?? null;
  }

  getFormError(form: FormKey): string | null {
    return this.forms.get(form)?.formError ?? null;
  }

  hasErrors(form: FormKey): boolean {
    const f = this.forms.get(form);
    if (!f) return false;
    return Boolean(f.formError) || f.fields.size > 0;
  }

  setFieldError(form: FormKey, field: FieldKey, message: string) {
    const f = this.getOrCreateForm(form);
    const msg = message.trim();
    if (!msg) {
      f.fields.delete(field);
      return;
    }
    f.fields.set(field, msg);
  }

  clearFieldError(form: FormKey, field: FieldKey) {
    const f = this.forms.get(form);
    if (!f) return;
    f.fields.delete(field);
  }

  setFormError(form: FormKey, message: string) {
    const f = this.getOrCreateForm(form);
    const msg = message.trim();
    f.formError = msg ? msg : null;
  }

  clearFormError(form: FormKey) {
    const f = this.forms.get(form);
    if (!f) return;
    f.formError = null;
  }

  clearForm(form: FormKey) {
    this.forms.delete(form);
  }

  clearAll() {
    this.forms.clear();
  }
}

