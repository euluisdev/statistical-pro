"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  FileText,
  Workflow,
} from "lucide-react";

import DocumentationLayout from "./components/DocumentationLayout";
import "./documentation.css";

export default function DocumentationHomePage() {
  return (
    <DocumentationLayout>
      <div className="doc-page">
        <header className="doc-header">
          <h1>Guia de Uso — SIX SIGMA</h1>

          <p>
            Documentação interna para utilização do sistema de análise
            estatística.
          </p>
        </header>

        <section className="doc-section">
          <h2>Bem-vindo à documentação</h2>

          <p>
            Este guia foi desenvolvido para auxiliar na utilização do sistema
            SIX SIGMA, apresentando os principais recursos, fluxos de trabalho
            e conceitos utilizados durante as análises.
          </p>

          <p>
            Utilize o menu lateral para acessar diretamente a área desejada.
          </p>
        </section>

        <section className="doc-section">
          <h2>Por onde começar?</h2>

          <p>
            Para realizar uma análise completa, recomenda-se seguir o fluxo
            abaixo:
          </p>

          <ol>
            <li>Selecionar ou criar um conjunto.</li>
            <li>Selecionar ou criar uma peça.</li>
            <li>Importar os arquivos de medição.</li>
            <li>Validar os dados extraídos.</li>
            <li>Realizar a análise estatística.</li>
            <li>Interpretar os resultados.</li>
            <li>Gerar o relatório final.</li>
          </ol>
        </section>

        <section className="doc-section">
          <h2>Acesso rápido</h2>

          <div className="doc-quick-links">
            <Link
              href="/documentation/home-page"
              className="doc-quick-link"
            >
              <div className="doc-quick-link-icon">
                <BookOpen size={20} />
              </div>

              <div>
                <strong>Página Inicial</strong>
                <span>
                  Aprenda a criar conjuntos, peças e importar arquivos.
                </span>
              </div>

              <ArrowRight size={17} />
            </Link>

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
                  Consulte os procedimentos completos de utilização.
                </span>
              </div>

              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        <footer className="doc-footer">
          <p>Sistema SIX SIGMA — Documentação Interna</p>
        </footer>
      </div>
    </DocumentationLayout>
  );
}  

  
 