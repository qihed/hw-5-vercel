'use client';

import Text from 'components/Text';
import Input from 'components/Input';
import Button from 'components/Button';
import sharedStyles from '../shared/settings-shared.module.scss';
import type { AddressesSectionProps } from './types';

export default function AddressesSection({ formId, store }: AddressesSectionProps) {
  const {
    addressesMounted,
    addresses,
    isAddingAddress,
    addressLabel,
    addressText,
    addressSubmitting,
    addressError,
    sortedAddresses,
    startAddAddress,
    cancelAddAddress,
    onAddressLabelChange,
    onAddressTextChange,
    onAddAddress,
    onRemoveAddress,
    onMakeDefaultAddress,
  } = store;

  return (
    <section className={sharedStyles.section}>
      <div className={sharedStyles.sectionHeader}>
        <div className={sharedStyles.sectionHeaderTop}>
          <Text tag="h2" view="p-20" weight="medium">
            Addresses
          </Text>
          {addresses.length > 0 && (
            <button
              type="button"
              className={sharedStyles.addIconButton}
              onClick={() => startAddAddress()}
              aria-label="Add address"
              title="Add address"
            >
              +
            </button>
          )}
        </div>
        <Text view="p-14" color="secondary">
          Used for delivery and order details.
        </Text>
      </div>

      <div className={sharedStyles.cardsGrid}>
        {addresses.length === 0 ? (
          <div className={sharedStyles.emptyState}>
            <Text view="p-16" weight="medium">
              No addresses yet
            </Text>
            <Text view="p-14" color="secondary">
              Add an address below to checkout faster next time.
            </Text>
          </div>
        ) : (
          sortedAddresses.map((a) => (
            <div key={a.id} className={sharedStyles.cardItem}>
              <div className={sharedStyles.cardTop}>
                <div className={sharedStyles.cardBrand}>{a.label?.trim() ? a.label : 'Address'}</div>
                {a.isDefault && <span className={sharedStyles.defaultPill}>Default</span>}
              </div>

              <Text view="p-16" weight="medium" className={sharedStyles.addressText}>
                {a.address}
              </Text>

              <div className={sharedStyles.cardActions}>
                {!a.isDefault && (
                  <button type="button" className={sharedStyles.linkButton} onClick={() => onMakeDefaultAddress(a.id)}>
                    Make default
                  </button>
                )}
                <button type="button" className={sharedStyles.linkButtonDanger} onClick={() => onRemoveAddress(a.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {(addresses.length === 0 || isAddingAddress) && (
        <>
          <div className={sharedStyles.divider} />

          <div className={sharedStyles.form}>
            <div className={sharedStyles.formHeader}>
              <Text tag="h3" view="p-18" weight="medium">
                Add a new address
              </Text>
              {addresses.length > 0 && (
                <button type="button" className={sharedStyles.linkButton} onClick={() => cancelAddAddress()}>
                  Cancel
                </button>
              )}
            </div>

            <div className={sharedStyles.formGrid}>
              <label className={sharedStyles.field} htmlFor={`${formId}-addr-label`}>
                <Text view="p-14" color="secondary" tag="span">
                  Label (optional)
                </Text>
                <Input
                  id={`${formId}-addr-label`}
                  placeholder="Home / Office"
                  value={addressLabel}
                  onChange={(v) => onAddressLabelChange(v)}
                  autoComplete="shipping address-level1"
                />
              </label>

              <label className={sharedStyles.field} htmlFor={`${formId}-addr`}>
                <Text view="p-14" color="secondary" tag="span">
                  Address
                </Text>
                <textarea
                  id={`${formId}-addr`}
                  className={sharedStyles.textarea}
                  value={addressText}
                  onChange={(e) => onAddressTextChange(e.target.value)}
                  rows={3}
                  autoComplete="shipping street-address"
                  placeholder="Street, house, apartment, city"
                />
              </label>
            </div>

            {addressError && (
              <Text view="p-14" className={sharedStyles.errorText}>
                {addressError}
              </Text>
            )}

            <div className={sharedStyles.formActions}>
              <Button type="button" onClick={onAddAddress} loading={addressSubmitting}>
                Add address
              </Button>
              {!addressesMounted && (
                <Text view="p-14" color="secondary">
                  Loading saved addresses…
                </Text>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

