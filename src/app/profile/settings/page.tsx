'use client';

import { useId } from 'react';
import Text from 'components/Text';
import styles from './settings-page.module.scss';
import { useSettingsPageModel } from './useSettingsPageModel';
import PaymentCardsSection from './components/PaymentCardsSection';
import AddressesSection from './components/AddressesSection';

export default function SettingsPage() {
  const formId = useId();
  const { payment, addresses } = useSettingsPageModel();

  return (
    <div className={styles.container}>
      <Text view="title" tag="h1" className={styles.title}>
        Settings
      </Text>
      <div className={styles.sections}>
        <PaymentCardsSection formId={formId} store={payment} />
        <AddressesSection formId={formId} store={addresses} />
      </div>
    </div>
  );
}

