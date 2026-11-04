import {
  Merriweather,
  Roboto_Mono,
  Roboto_Serif,
  Yatra_One,
  PT_Sans_Caption,
} from "next/font/google";

export const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"], // Include the weights you need
  variable: "--font-merriweather", // Optional: Define a CSS variable
});

export const pt_sans_caption = PT_Sans_Caption({
  subsets: ["latin"],
  weight: ["400", "700"], // Available weights for this font
  display: "swap",
  variable: "--font-pt-sans-caption", // optional CSS variable if you're using CSS vars
});

export const roboto_mono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});
export const roboto_serif = Roboto_Serif({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});
export const yatra = Yatra_One({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});
