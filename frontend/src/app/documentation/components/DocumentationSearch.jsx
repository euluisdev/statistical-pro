"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

const documentationPages = [
  {
    title: "Início",
    href: "/documentation",
    description: "Página inicial da documentação.",
    keywords: "inicio documentação guia começo",
  },
  {
    title: "Visão Geral",
    href: "/documentation/system",
    description: "Entenda a estrutura e o funcionamento geral do SIX SIGMA.",
    keywords:
      "sistema visão geral estrutura conjunto peça job fluxo funcionamento",
  },
  {
    title: "Página Inicial",
    href: "/documentation/home-page",
    description:
      "Criação de conjuntos, peças e importação dos arquivos de medição.",
    keywords:
      "conjunto peça txt arquivo importação medição dados página inicial",
  },
  {
    title: "Análise",
    href: "/documentation/analysis",
    description:
      "Geração das análises e consulta dos resultados estatísticos.",
    keywords:
      "análise estatística semana ano histórico cp cpk cg control chart capability",
  },
  {
    title: "Plano de Ação",
    href: "/documentation/action-plan",
    description:
      "Registro e acompanhamento das ações relacionadas aos resultados.",
    keywords:
      "plano ação cpk acompanhamento semana ação prazo filtro",
  },
  {
    title: "Report Builder",
    href: "/documentation/report-builder",
    description:
      "Montagem, organização e exportação do relatório final.",
    keywords:
      "relatório report builder pdf gráfico canvas template snapshot exportação",
  },
  {
    title: "Fluxos de Trabalho",
    href: "/documentation/workflows",
    description:
      "Procedimento completo de utilização do sistema.",
    keywords:
      "fluxo workflow procedimento processo txt análise relatório job",
  },
  {
    title: "Conceitos",
    href: "/documentation/concepts",
    description:
      "Conceitos estatísticos utilizados nas análises.",
    keywords:
      "conceitos cp cpk capacidade capacidade processo estatística média desvio controle",
  },
  {
    title: "Ajuda / FAQ",
    href: "/documentation/help",
    description:
      "Dúvidas frequentes e problemas comuns.",
    keywords:
      "ajuda faq problema erro suporte dúvida arquivos job relatório",
  },
];

export default function DocumentationSearch() {
  const [search, setSearch] = useState("");

  const results = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      return [];
    }

    return documentationPages.filter((page) => {
      const content = `
        ${page.title}
        ${page.description}
        ${page.keywords}
      `.toLowerCase();

      return content.includes(normalizedSearch);
    });
  }, [search]);

  function clearSearch() {
    setSearch("");
  }

  return (
    <div className="doc-search">

      <div className="doc-search-input-wrapper">

        <Search
          size={16}
          className="doc-search-icon"
        />

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Pesquisar documentação..."
          className="doc-search-input"
          aria-label="Pesquisar documentação"
        />

        {search && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Limpar pesquisa"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              color: "#9ca3af",
            }}
          >
            <X size={15} />
          </button>
        )}

      </div>


      {search.trim() && (
        <div className="doc-search-results">

          {results.length > 0 ? (
            results.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="doc-search-result"
                onClick={clearSearch}
              >
                <span className="doc-search-result-title">
                  {page.title}
                </span>

                <span className="doc-search-result-description">
                  {page.description}
                </span>
              </Link>
            ))
          ) : (
            <div className="doc-search-empty">
              Nenhum resultado encontrado para{" "}
              <strong>"{search}"</strong>.
            </div>
          )}

        </div>
      )}

    </div>
  );
}