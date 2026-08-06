'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  sanitizeHtml,
} from '@/utils/security/sanitizeHtml';

interface SafeHtmlProps {
  html: string | null | undefined;
  className?: string;
}

export const SafeHtml = ({
  html,
  className,
}: SafeHtmlProps) => {
  const [sanitizedHtml, setSanitizedHtml] = useState('');

  useEffect(() => {
    setSanitizedHtml(sanitizeHtml(html ?? ''));
  }, [html]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{
        __html: sanitizedHtml,
      }}
    />
  );
};

export default SafeHtml;
