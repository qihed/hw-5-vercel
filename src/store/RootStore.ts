import { CartStore } from 'store/CartStore';
import { CatalogStore } from 'store/CatalogStore';
import QueryParamsStore from 'store/QueryParamsStore';
import { AuthStore } from './AuthStore';
import { ComparisonStore } from './ComparisonStore';
import { ValidationStore } from './ValidationStore';
import { WidgetStore } from 'widget/model/WidgetStore';
import { ProductPropsStore } from 'widget/model/ProductPropsStore';
import { FavoritesStore } from './FavoritesStore';

export default class RootStore {
  readonly query = new QueryParamsStore();
  readonly catalog = new CatalogStore();
  readonly cart = new CartStore();
  readonly auth = new AuthStore();
  readonly comparison = new ComparisonStore();
  readonly favorites = new FavoritesStore();
  readonly validation = new ValidationStore();

  // Comparison widget: UI mode & in-memory extended props cache.
  readonly comparisonWidget = new WidgetStore();
  readonly productProps = new ProductPropsStore();
}