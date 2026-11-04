import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { pt_sans_caption } from "@/utils/font";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${pt_sans_caption?.className} bg-gray-100 dark:bg-theme-dark text-theme-dark dark:text-gray-200`}
      >
        {children}
      </body>
    </html>
  );
}
