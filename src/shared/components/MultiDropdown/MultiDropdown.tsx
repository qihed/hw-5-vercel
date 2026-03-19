import React from 'react';
import cn from 'classnames';
import Input from 'components/Input';
import ArrowDownIcon from 'icons/ArrowDownIcon';
import styles from 'components/MultiDropdown/MultiDropdown.module.scss';

export type Option = {
  key: string;
  value: string;
};

export type MultiDropdownProps = {
  className?: string;
  options: Option[];
  value: Option[];
  onChange: (value: Option[]) => void;
  disabled?: boolean;
  getTitle: (value: Option[]) => string;
};

const MultiDropdown: React.FC<MultiDropdownProps> = ({
  className,
  options,
  value,
  onChange,
  disabled,
  getTitle,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const isSelected = (opt: Option) => value.some((v) => v.key === opt.key);

  const toggleOption = (opt: Option) => {
    if (isSelected(opt)) {
      onChange(value.filter((v) => v.key !== opt.key));
    } else {
      onChange([...value, opt]);
    }
  };

  const filtered = options.filter((o) => o.value.toLowerCase().includes(query.toLowerCase()));

  const title = getTitle(value);
  const selectedTitle = value.length ? title : '';
  const inputValue = isOpen ? query || selectedTitle : selectedTitle;
  const placeholder = value.length ? undefined : title || 'Filter';
  const hasValue = value.length > 0;

  return (
    <div className={cn(styles.root, className)} ref={rootRef}>
      <div
        className={hasValue ? styles.triggerWrapActive : styles.triggerWrap}
        onClick={(e) => {
          if (disabled) return;
          if (isOpen && (e.target as HTMLElement).closest('input')) return;
          setIsOpen((prev) => {
            if (prev) setQuery('');
            return !prev;
          });
        }}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && setIsOpen((prev) => !prev)}
        role="button"
        tabIndex={disabled ? undefined : 0}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Input
          value={inputValue}
          afterSlot={
            <span className={cn(styles.chevron, isOpen && styles.chevronOpen)} aria-hidden>
              <ArrowDownIcon color="secondary" />
            </span>
          }
          className={styles.borderStyle}
          onChange={(val) => {
            setQuery(val);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>

      {isOpen && !disabled && (
        <div className={styles.mddFrame}>
          {filtered.map((opt) => (
            <div className={styles.mddFrameItem} key={opt.key} onClick={() => toggleOption(opt)}>
              <input
                className={styles.noCheckbox}
                type="checkbox"
                readOnly
                checked={isSelected(opt)}
              />
              <span>{opt.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiDropdown;
