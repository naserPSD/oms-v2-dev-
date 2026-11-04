/** Sanzio HR mark — source file is 64×56 (8∶7). Match this ratio in Next/Image. */
export const HR_ICON_W = 32;
export const HR_ICON_H = 28;
export const HR_ICON_WEBP = "/images/sanzio-hr-icon-only.webp";
export const HR_ICON_PNG = "/images/sanzio-hr-icon-only.png";

export const hrIconImageProps = {
  width: HR_ICON_W,
  height: HR_ICON_H,
  sizes: `${HR_ICON_W}px`,
  style: {
    width: HR_ICON_W,
    height: HR_ICON_H,
    objectFit: "contain",
    display: "block",
  },
};
