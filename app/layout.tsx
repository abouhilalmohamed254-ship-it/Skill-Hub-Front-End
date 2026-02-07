import type { Metadata } from "next"
import { Gabarito } from "next/font/google"
import "./globals.css"

const gabarito = Gabarito({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Skill Hub - Learn Anything",
  description:
    "An online learning platform focused on delivering high quality, structured courses across multiple disciplines.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={gabarito.className}>{children}</body>
    </html>
  )
}
