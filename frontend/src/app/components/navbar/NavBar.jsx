import { ArrowBigRight, ChartLine, House, ChartNoAxesCombined, TrendingUpDown, ChartColumnStacked } from "lucide-react";
import './NavBar.css';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <img src="/logo-ieb.png" alt="Logo" className="logo-icon" />
          <span>IEB-PE</span>
        </div>
        <nav className="nav-links">
          <a href="/"><House /></a>
          <a href="/"><ChartColumnStacked /></a>
          <a href="/"><ChartNoAxesCombined /></a>
        </nav>
      </div>
    </header>
  );
}