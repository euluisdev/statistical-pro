import { Settings, House, MessageSquareWarning } from "lucide-react";
import './NavBar.css';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <img src="/logo-ieb.png" alt="Logo" className="logo-icon" />
          <span>ITAESBRA-PE</span>
        </div>
        <nav className="nav-links">
          <a href="/"><House /></a>
          <a href="/documentation"><MessageSquareWarning /></a>
        </nav>
      </div>
    </header>
  );
}