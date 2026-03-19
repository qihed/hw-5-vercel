'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Text from 'components/Text';
import Input from 'components/Input';
import Button from 'components/Button';
import EyeIcon from 'icons/EyeIcon';
import EyeOffIcon from 'icons/EyeOffIcon';
import sharedStyles from '../shared/settings-shared.module.scss';
import type { PaymentCardsSectionProps } from './types';

export default function PaymentCardsSection({ formId, store }: PaymentCardsSectionProps) {
  const {
    mounted,
    cards,
    isAdding,
    cardNumber,
    exp,
    cardholderName,
    cvc,
    submitting,
    error,
    canSubmit,
    brandLabel,
    startAddCard,
    cancelAddCard,
    onCardNumberChange,
    onExpChange,
    onCardholderNameChange,
    onCvcChange,
    onAddCard,
    onRemoveCard,
    onMakeDefault,
  } = store;
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlipped = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className={sharedStyles.section}>
      <div className={sharedStyles.sectionHeader}>
        <div className={sharedStyles.sectionHeaderTop}>
          <Text tag="h2" view="p-20" weight="medium">
            Payment cards
          </Text>
          {cards.length > 0 && (
            <button type="button" className={sharedStyles.addIconButton} onClick={() => startAddCard()} aria-label="Add card" title="Add card">
              +
            </button>
          )}
        </div>
        <Text view="p-14" color="secondary">
          Saved locally on this device.
        </Text>
      </div>

      <div className={sharedStyles.cardsGrid}>
        {cards.length === 0 ? (
          <div className={sharedStyles.emptyState}>
            <Text view="p-16" weight="medium">
              No cards yet
            </Text>
            <Text view="p-14" color="secondary">
              Add a card below to pay faster next time.
            </Text>
          </div>
        ) : (
          cards
            .slice()
            .sort((a, b) => Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)) || b.createdAt - a.createdAt)
            .map((c) => (
              <div key={c.id} className={sharedStyles.cardItem}>
                <div className={sharedStyles.cardFlipWrapper}>
                  <motion.div
                    className={sharedStyles.cardFlipInner}
                    animate={{ rotateY: flippedCards[c.id] ? 180 : 0 }}
                    transition={{ duration: 0.45, ease: 'easeInOut' }}
                  >
                    <div className={sharedStyles.cardFace}>
                      <div className={sharedStyles.cardTop}>
                        <div className={sharedStyles.cardBrand}>{(c.brand || 'unknown') === 'unknown' ? 'Card' : c.brand}</div>
                        <div className={sharedStyles.cardTopActions}>
                          <button
                            type="button"
                            className={sharedStyles.eyeButton}
                            onClick={() => toggleFlipped(c.id)}
                            aria-label={flippedCards[c.id] ? 'Show card front' : 'Show card details'}
                            title={flippedCards[c.id] ? 'Show card front' : 'Show card details'}
                          >
                            {flippedCards[c.id] ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
                          </button>
                          {c.isDefault && <span className={sharedStyles.defaultPill}>Default</span>}
                        </div>
                      </div>

                      <Text view="p-18" weight="medium" className={sharedStyles.cardNumber}>
                        •••• •••• •••• {c.last4}
                      </Text>

                      <div className={sharedStyles.cardMeta}>
                        <Text view="p-14" color="secondary">
                          {c.expMonth}/{c.expYear.slice(-2)}
                        </Text>
                      </div>

                      <div className={sharedStyles.cardActions}>
                        {!c.isDefault && (
                          <button type="button" className={sharedStyles.linkButton} onClick={() => onMakeDefault(c.id)}>
                            Make default
                          </button>
                        )}
                        <button type="button" className={sharedStyles.linkButtonDanger} onClick={() => onRemoveCard(c.id)}>
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className={sharedStyles.cardFaceBack}>
                      <div className={sharedStyles.cardTop}>
                        <div className={sharedStyles.cardBrand}>Card details</div>
                        <button
                          type="button"
                          className={sharedStyles.eyeButton}
                          onClick={() => toggleFlipped(c.id)}
                          aria-label="Show card front"
                          title="Show card front"
                        >
                          <EyeOffIcon width={18} height={18} />
                        </button>
                      </div>

                      <div className={sharedStyles.backRows}>
                        <div>
                          <Text view="p-14" color="secondary">
                            Cardholder
                          </Text>
                          <Text view="p-16" weight="medium" className={sharedStyles.backValue}>
                            {(c.cardholderName || '—').toUpperCase()}
                          </Text>
                        </div>
                        <div>
                          <Text view="p-14" color="secondary">
                            CVC
                          </Text>
                          <Text view="p-16" weight="medium" className={sharedStyles.backValue}>
                            {c.cvc || '—'}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            ))
        )}
      </div>

      {(cards.length === 0 || isAdding) && (
        <>
          <div className={sharedStyles.divider} />

          <div className={sharedStyles.form}>
            <div className={sharedStyles.formHeader}>
              <Text tag="h3" view="p-18" weight="medium">
                Add a new card
              </Text>
              {cards.length > 0 && (
                <button type="button" className={sharedStyles.linkButton} onClick={() => cancelAddCard()}>
                  Cancel
                </button>
              )}
            </div>

            <div className={sharedStyles.formGrid}>
              <label className={sharedStyles.field} htmlFor={`${formId}-number`}>
                <Text view="p-14" color="secondary" tag="span">
                  Card number
                </Text>
                <Input
                  id={`${formId}-number`}
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(v) => onCardNumberChange(v)}
                  inputMode="numeric"
                  autoComplete="cc-number"
                  afterSlot={<span className={sharedStyles.afterSlot}>{brandLabel}</span>}
                />
              </label>

              <label className={sharedStyles.field} htmlFor={`${formId}-exp`}>
                <Text view="p-14" color="secondary" tag="span">
                  Expiration (MM/YY)
                </Text>
                <Input
                  id={`${formId}-exp`}
                  placeholder="MM/YY"
                  value={exp}
                  onChange={(v) => onExpChange(v)}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                />
              </label>

              <label className={sharedStyles.field} htmlFor={`${formId}-cardholder`}>
                <Text view="p-14" color="secondary" tag="span">
                  Cardholder name
                </Text>
                <Input
                  id={`${formId}-cardholder`}
                  placeholder="Name Surname"
                  value={cardholderName}
                  onChange={(v) => onCardholderNameChange(v)}
                  autoComplete="cc-name"
                />
              </label>

              <label className={sharedStyles.field} htmlFor={`${formId}-cvc`}>
                <Text view="p-14" color="secondary" tag="span">
                  CVC
                </Text>
                <Input
                  id={`${formId}-cvc`}
                  placeholder="123"
                  value={cvc}
                  onChange={(v) => onCvcChange(v)}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                />
              </label>
            </div>

            {error && (
              <Text view="p-14" className={sharedStyles.errorText}>
                {error}
              </Text>
            )}

            <div className={sharedStyles.formActions}>
              <Button type="button" onClick={onAddCard} loading={submitting} disabled={!canSubmit}>
                Add card
              </Button>
              {!mounted && (
                <Text view="p-14" color="secondary">
                  Loading saved cards…
                </Text>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

