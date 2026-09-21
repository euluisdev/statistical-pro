"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BarChart3,
  FileText,
  Workflow,
} from "lucide-react";

import DocumentationLayout from "../components/DocumentationLayout";
import "../documentation.css";
import "./home-page.css";

export default function DocumentationHomePage() {
  return (
    <DocumentationLayout>
      <div className="doc-page">

        <header className="doc-header">
          <h1>Guia de Uso — Página Inicial</h1>

          <p>
            Aprenda a utilizar a página inicial do sistema SIX SIGMA,
            desde a criação dos conjuntos até a importação dos arquivos
            de medição.
          </p>
        </header>


        <section className="doc-section">
          <h2>Objetivo desta página</h2>

          <p>
            A página inicial é o ponto de entrada para o fluxo de análise
            do sistema SIX SIGMA. É nela que o usuário organiza os dados
            que serão utilizados posteriormente nas análises estatísticas.
          </p>

          <p>
            O fluxo principal envolve a criação ou seleção de um conjunto,
            o gerenciamento das peças e a importação dos arquivos de
            medição.
          </p>
        </section>


        <section className="doc-section">
          <h2>Fluxo básico</h2>

          <p>
            Para iniciar uma análise, siga a sequência abaixo:
          </p>

          <ol>
            <li>Selecionar ou criar um conjunto.</li>
            <li>Selecionar ou criar uma peça.</li>
            <li>Importar os arquivos de medição.</li>
            <li>Verificar os dados importados.</li>
            <li>Prosseguir para a análise estatística.</li>
          </ol>
        </section>


        <section className="doc-section">
          <h2>Acesso rápido</h2>

          <div className="doc-quick-links">

            <Link
              href="/documentation/analysis"
              className="doc-quick-link"
            >
              <div className="doc-quick-link-icon">
                <BarChart3 size={20} />
              </div>

              <div>
                <strong>Análise</strong>

                <span>
                  Entenda o fluxo de análise e visualização dos resultados.
                </span>
              </div>

              <ArrowRight size={17} />
            </Link>


            <Link
              href="/documentation/action-plan"
              className="doc-quick-link"
            >
              <div className="doc-quick-link-icon">
                <BookOpen size={20} />
              </div>

              <div>
                <strong>Plano de Ação</strong>

                <span>
                  Consulte como utilizar os recursos relacionados ao plano
                  de ação.
                </span>
              </div>

              <ArrowRight size={17} />
            </Link>


            <Link
              href="/documentation/report-builder"
              className="doc-quick-link"
            >
              <div className="doc-quick-link-icon">
                <FileText size={20} />
              </div>

              <div>
                <strong>Report Builder</strong>

                <span>
                  Consulte o processo de montagem e exportação do relatório.
                </span>
              </div>

              <ArrowRight size={17} />
            </Link>


            <Link
              href="/documentation/workflows"
              className="doc-quick-link"
            >
              <div className="doc-quick-link-icon">
                <Workflow size={20} />
              </div>

              <div>
                <strong>Fluxos de Trabalho</strong>

                <span>
                  Consulte os procedimentos completos de utilização
                  do sistema.
                </span>
              </div>

              <ArrowRight size={17} />
            </Link>

          </div>
        </section>


        <footer className="doc-footer">
          <p>
            Sistema SIX SIGMA — Documentação Interna
          </p>
        </footer>

      </div>
    </DocumentationLayout>
  );
}  
 
 