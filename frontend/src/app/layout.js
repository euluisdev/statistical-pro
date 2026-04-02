import Navbar from "./components/navbar/NavBar";
import { ToastProvider } from "@/app/components/providers/ToastProvider";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        <ToastProvider>
          <Navbar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
