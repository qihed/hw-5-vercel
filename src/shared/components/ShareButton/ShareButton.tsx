'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import styles from './ShareButton.module.scss';

export type ShareButtonProps = {
  title?: string;
  url?: string;
  text?: string;
  label?: string;
  iconOnly?: boolean;
  disabled?: boolean;
  className?: string;
};

function getShareUrl(providedUrl?: string) {
  if (providedUrl && providedUrl.trim()) return providedUrl.trim();
  if (typeof window === 'undefined') return '';
  return window.location.href;
}

async function copyToClipboard(text: string) {
  if (!text) throw new Error('Missing text');

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback for older browsers
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!ok) throw new Error('Copy failed');
}

const ShareButton = ({
  title,
  url,
  text,
  label = 'Share',
  iconOnly = false,
  disabled,
  className,
}: ShareButtonProps) => {
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (sharing || disabled) return;

    const shareUrl = getShareUrl(url);
    if (!shareUrl) {
      toast.error('Unable to share: missing URL.');
      return;
    }

    setSharing(true);
    try {
      // Copy payload immediately on click (best-effort).
      // For cart sharing this payload is the text message; for existing usages it's the link.
      let copiedToClipboard = false;
      try {
        const payload = text?.trim() ? text.trim() : shareUrl;
        await copyToClipboard(payload);
        copiedToClipboard = true;
      } catch {
        copiedToClipboard = false;
      }

      // Prefer native share (mobile/share sheets)
      if (navigator.share) {
        await navigator.share({
          title: title ?? 'Share',
          url: shareUrl,
          ...(text?.trim() ? { text: text.trim() } : {}),
        });
        toast.success('Thanks for sharing.');
        return;
      }

      if (copiedToClipboard) {
        toast.success(text?.trim() ? 'Message copied.' : 'Link copied.');
      } else {
        // Try at least copying the URL if message copy failed.
        const payload = text?.trim() ? text.trim() : shareUrl;
        await copyToClipboard(payload);
        toast.success(text?.trim() ? 'Message copied.' : 'Link copied.');
      }
    } catch {
      toast.error('Unable to share. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <button
      type="button"
      className={`${styles.button} ${iconOnly ? styles.iconOnly : ''} ${className ?? ''}`.trim()}
      onClick={handleShare}
      disabled={disabled || sharing}
      aria-label={label}
      title={label}
    >
      <span className={styles.icon} aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
          <path d="M16 6l-4-4-4 4" />
          <path d="M12 2v14" />
        </svg>
      </span>
      {!iconOnly && <span className={styles.label}>{sharing ? 'Sharing...' : label}</span>}
    </button>
  );
};

export default ShareButton;

