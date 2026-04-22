import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip"

// Configuração da fonte Inter
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "TechRent",
  description: "Sistema de gerenciamento de aluguéis",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-br"
      className={`h-full dark ${inter.className}`} // Adicionada a classe da fonte aqui
      style={{ colorScheme: 'dark' }} // Garante que o scrollbar e elementos nativos fiquem escuros
    >
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}