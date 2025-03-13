import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { OBSProvider } from '@/context/OBSContext'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      storageKey="obs-panel-theme"
    >
      <OBSProvider>
        {children}
        <Toaster />
      </OBSProvider>
    </ThemeProvider>
  )
}