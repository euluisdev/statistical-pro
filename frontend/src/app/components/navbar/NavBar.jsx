"use client";

import { House, MessageSquareWarning } from "lucide-react";
import { usePathname } from "next/navigation";
import './NavBar.css';

export default function Navbar() {
  const pathname = usePathname();

  const PRINT_ROUTES = [
    "/action-plan/print",
    "/capability/print",
    "/control-chart/print",
  ];

  const hideNavbar = PRINT_ROUTES.some(route =>
    pathname.includes(route)
  );

  //if for uma rota de impressão, não renderiza a navbar
  if (hideNavbar) return null;

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <img src="/logo-ieb.png" alt="Logo" className="logo-icon" />
          <span>ITAESBRA-PE</span>
        </div>

        <nav className="nav-links">
          <a href="/">
            <House />
          </a>

          <a href="/documentation">
            <MessageSquareWarning />
          </a>
        </nav>
      </div>
    </header>
  );
}  
 
