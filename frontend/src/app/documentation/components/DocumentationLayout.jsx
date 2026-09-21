"use client";

import DocumentationSidebar from "./DocumentationSidebar";
import DocumentationSearch from "./DocumentationSearch";

export default function DocumentationLayout({ children }) {
  return (
    <div className="doc-layout">

      <DocumentationSidebar />

      <main className="doc-main">

        <header className="doc-topbar">

          <div>
            <span className="doc-topbar-title">
              SIX SIGMA
            </span>

            <span className="doc-topbar-separator">
              /
            </span>

            <span className="doc-topbar-current">
              Documentação
            </span>
          </div>


          <DocumentationSearch />

        </header>


        <div className="doc-content">
          {children}
        </div>

      </main>

    </div>
  );
}
 
 
