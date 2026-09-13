export const FIGMA_FILE_KEY = 'DCj8hd61o7UzBWTNSmhVkw';
export const approvedFigmaFrames = {
  home: { desktop: '3438:21891', mobile: '3438:22006' },
  productList: { desktop: '3983:16678', mobile: '3983:16678' },
  productDetail: { desktop: '3983:16559', mobile: '3983:16559' },
  cart: { desktop: '3808:16167', mobile: '3808:16295' },
} as const;
export const getFigmaFrameUrl = (nodeId: string): string =>
  `https://www.figma.com/design/${FIGMA_FILE_KEY}/carnix?node-id=${nodeId.replace(':', '-')}`;
