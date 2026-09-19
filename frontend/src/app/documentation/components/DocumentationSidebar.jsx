"use client";

import Link from "next/link";
import {
  BookOpen,
  Home,
  LayoutDashboard,
  BarChart3,
  Target,
  FileText,
  Workflow,
  BookMarked,
  CircleHelp,
} from "lucide-react";

const menuItems = [
  {
    title: "Início",
    href: "/documentation",
    icon: Home,
  },
  {
    title: "Visão Geral",
    href: "/documentation/system",
    icon: BookOpen,
  },
  {
    title: "Página Inicial",
    href: "/documentation/home-page",
    icon: LayoutDashboard,
  },
  {
    title: "Análise",
    href: "/documentation/analysis",
    icon: BarChart3,
  },
  {
    title: "Plano de Ação",
    href: "/documentation/action-plan",
    icon: Target,
  },
  {
    title: "Report Builder",
    href: "/documentation/report-builder",
    icon: FileText,
  },
  {
    title: "Fluxos de Trabalho",
    href: "/documentation/workflows",
    icon: Workflow,
  },
  {
    title: "Conceitos",
    href: "/documentation/concepts",
    icon: BookMarked,
  },
  {
    title: "Ajuda / FAQ",
    href: "/documentation/help",
    icon: CircleHelp,
  },
];

export default function DocumentationSidebar() {
  return (
    <aside className="doc-sidebar">
      <div className="doc-sidebar-header">
        <div className="doc-sidebar-logo">
          <BarChart3 size={22} />
        </div>

        <div>
          <strong>SIX SIGMA</strong>
          <span>Documentação</span>
        </div>
      </div>

      <nav className="doc-sidebar-nav">
        <span className="doc-sidebar-label">NAVEGAÇÃO</span>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="doc-sidebar-link"
            >
              <Icon size={18} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="doc-sidebar-footer">
        <span>SIX SIGMA</span>
        <small>Guia de Uso</small>
      </div>
    </aside>
  );
}  
 
  