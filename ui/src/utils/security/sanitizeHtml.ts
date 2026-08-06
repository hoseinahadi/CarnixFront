const BLOCKED_ELEMENTS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'option',
  'meta',
  'link',
  'base',
  'svg',
  'math',
  'canvas',
]);

const URL_ATTRIBUTES = new Set([
  'href',
  'src',
  'poster',
  'cite',
]);

const isSafeUrl = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();

  if (
    normalized.startsWith('/') ||
    normalized.startsWith('#') ||
    normalized.startsWith('./') ||
    normalized.startsWith('../')
  ) {
    return true;
  }

  return (
    normalized.startsWith('https://') ||
    normalized.startsWith('http://') ||
    normalized.startsWith('mailto:') ||
    normalized.startsWith('tel:')
  );
};

/**
 * Sanitizer سمت مرورگر با Allow/Deny list محافظه‌کارانه.
 * Backend نیز باید همین محتوا را پیش از ذخیره Sanitise کند.
 */
export const sanitizeHtml = (html: string): string => {
  if (typeof window === 'undefined' || !html) {
    return '';
  }

  const documentNode = new DOMParser().parseFromString(
    html,
    'text/html',
  );

  const allElements = Array.from(
    documentNode.body.querySelectorAll('*'),
  );

  allElements.forEach((element) => {
    const tagName = element.tagName.toLowerCase();

    if (BLOCKED_ELEMENTS.has(tagName)) {
      element.remove();
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value;

      if (
        name.startsWith('on') ||
        name === 'style' ||
        name === 'srcdoc' ||
        name === 'formaction'
      ) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (
        URL_ATTRIBUTES.has(name) &&
        !isSafeUrl(value)
      ) {
        element.removeAttribute(attribute.name);
      }
    });

    if (tagName === 'a') {
      element.setAttribute('rel', 'noopener noreferrer nofollow');
    }
  });

  return documentNode.body.innerHTML;
};
