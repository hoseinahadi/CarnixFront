type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | null =>
  value && typeof value === 'object' ? value as UnknownRecord : null;

const readUrl = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

const imageFromCollection = (value: unknown): string | null => {
  if (!Array.isArray(value)) return null;

  const records = value.map(asRecord).filter((item): item is UnknownRecord => Boolean(item));
  const primary = records.find((item) => Boolean(item.isPrimary ?? item.IsPrimary ?? item.isMain ?? item.IsMain));
  const selected = primary ?? records[0];
  return selected
    ? readUrl(selected.imageUrl ?? selected.ImageUrl ?? selected.url ?? selected.Url)
    : null;
};

/** Reads a product image from the different cart/order API response shapes. */
export function getProductImageSource(value: unknown): string | null {
  const item = asRecord(value);
  if (!item) return null;

  const product = asRecord(item.product ?? item.Product);
  const directCandidates = [
    item.imageUrl,
    item.ImageUrl,
    item.thumbnailUrl,
    item.ThumbnailUrl,
    product?.imageUrl,
    product?.ImageUrl,
    product?.thumbnailUrl,
    product?.ThumbnailUrl,
  ];

  for (const candidate of directCandidates) {
    const url = readUrl(candidate);
    if (url) return url;
  }

  return imageFromCollection(item.images ?? item.Images)
    ?? imageFromCollection(product?.images ?? product?.Images);
}
