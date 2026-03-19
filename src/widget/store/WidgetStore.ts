import { makeAutoObservable } from 'mobx';
import type RootStore from 'store/RootStore';
import { isPiPSupported, openComparisonInPiP } from 'widget/ComparisonWidget/pipComparison';

export class WidgetStore {
  private readonly root: RootStore;

  comparisonWidgetOpen = false;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  openComparisonWidget() {
    this.comparisonWidgetOpen = true;
  }

  closeComparisonWidget() {
    this.comparisonWidgetOpen = false;
  }

  toggleComparisonWidget() {
    this.comparisonWidgetOpen = !this.comparisonWidgetOpen;
  }

  /**
   * Основной сценарий для кнопки в хедере:
   * - если поддерживается Document PiP, пытаемся открыть PiP
   * - при ошибке (или отсутствии поддержки) открываем обычный виджет
   */
  async openComparisonPreferPiP(): Promise<void> {
    if (!isPiPSupported()) {
      this.toggleComparisonWidget();
      return;
    }

    try {
      await openComparisonInPiP(this.root);
    } catch {
      this.openComparisonWidget();
    }
  }
}

