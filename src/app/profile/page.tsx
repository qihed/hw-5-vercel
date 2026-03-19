'use client';

import { observer } from 'mobx-react-lite';
import Text from 'components/Text';
import Input from 'components/Input';
import Button from 'components/Button';
import { useStore } from 'store/StoreContext';
import styles from './profile-page.module.scss';

const ProfilePage = () => {
  const { auth } = useStore();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    auth.saveProfile();
  };

  return (
    <div className={styles.container}>
      <Text view="title" tag="h1" className={styles.title}>
        Personal Information
      </Text>

      <form onSubmit={handleSave} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="nickname" className={styles.label}>
            Nickname
          </label>
          <Input id="nickname" value={auth.nickname} onChange={auth.setNickname} className={styles.input} />
        </div>

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <Input id="email" type="email" value={auth.profileEmail} onChange={auth.setProfileEmail} className={styles.input} />
        </div>

        <div className={styles.field}>
          <label htmlFor="phone" className={styles.label}>
            Phone
          </label>
          <Input id="phone" type="tel" value={auth.phone} onChange={auth.setPhone} className={styles.input} />
        </div>

        <Button type="submit" className={styles.submitButton}>
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default observer(ProfilePage);
