import { Inter } from "next/font/google";

// Temporary: Inter until the licensed Söhne web files arrive, then swap to next/font/local.
export const brandFont = Inter({
  subsets: ["latin"],
  variable: "--font-brand",
  display: "swap",
});
