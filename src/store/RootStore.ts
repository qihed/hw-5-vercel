import { CartStore } from 'store/CartStore';
import { CatalogStore } from 'store/CatalogStore';
import QueryParamsStore from 'store/QueryParamsStore';
import { AuthStore } from './AuthStore';
import { ComparisonStore } from './ComparisonStore';
import { ValidationStore } from './ValidationStore';

export default class RootStore {
  readonly query = new QueryParamsStore();
  readonly catalog = new CatalogStore();
  readonly cart = new CartStore();
  readonly auth = new AuthStore();
  readonly comparison = new ComparisonStore();
  readonly validation = new ValidationStore();
}