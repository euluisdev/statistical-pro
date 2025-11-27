import Navbar from "./components/navbar/NavBar";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
