import { ClerkProvider } from "@clerk/nextjs"
import { Syne, Inter, JetBrains_Mono } from "next/font/google"

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["700", "800"],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500"],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${syne.variable} ${inter.variable} ${jetbrains.variable}`}>
        <body style={{ margin: 0, background: "#F7F5F0" }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}