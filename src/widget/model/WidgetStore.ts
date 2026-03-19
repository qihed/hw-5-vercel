import { makeAutoObservable } from 'mobx';
import type { ComparisonWidgetMode } from './types';

export class WidgetStore {
  mode: ComparisonWidgetMode = 'closed';

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  openOverlay() {
    this.mode = 'overlay';
  }

  openPiP() {
    this.mode = 'pip';
  }

  close() {
    this.mode = 'closed';
  }

  setMode(mode: ComparisonWidgetMode) {
    this.mode = mode;
  }

  get isOpen() {
    return this.mode !== 'closed';
  }

  get isOverlay() {
    return this.mode === 'overlay';
  }

  get isPiP() {
    return this.mode === 'pip';
  }
}

