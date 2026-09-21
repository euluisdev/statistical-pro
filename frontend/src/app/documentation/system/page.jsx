"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  FileText,
  FolderKanban,
  Workflow,
} from "lucide-react";

import DocumentationLayout from "../components/DocumentationLayout";
import "../documentation.css";
import "./system.css";

export default function DocumentationSystemPage() {
  return (
    <DocumentationLayout>
      <div className="doc-page">

        <header className="doc-header">
          <h1>Visão Geral do Sistema</h1>

          <p>
            Entenda a finalidade do SIX SIGMA, sua estrutura e o fluxo
            utilizado para transformar os arquivos de medição em análises
            estatísticas e relatórios.
          </p>
        </header>


        <section className="doc-section">
          <h2>O que é o SIX SIGMA?</h2>

          <p>
            O SIX SIGMA é um sistema interno desenvolvido para centralizar,
            organizar e automatizar o processo de análise estatística dos
            dados provenientes das medições.
          </p>

          <p>
            O sistema permite organizar os estudos por conjuntos e peças,
            importar os arquivos de medição, gerar os dados necessários
            para as análises, visualizar indicadores estatísticos e
            construir o relatório final.
          </p>
        </section>


        <section className="doc-section">
          <h2>Estrutura do sistema</h2>

          <div className="system-flow">

            <div className="system-card">
              <FolderKanban size={24} />
              <strong>Conjunto</strong>
              <span>
                Agrupa as peças relacionadas ao estudo.
              </span>
            </div>

            <div className="system-arrow">
              <ArrowRight size={20} />
            </div>

            <div className="system-card">
              <BarChart3 size={24} />
              <strong>Peça</strong>
              <span>
                Contém os dados e arquivos utilizados na análise.
              </span>
            </div>

            <div className="system-arrow">
              <ArrowRight size={20} />
            </div>

            <div className="system-card">
              <Workflow size={24} />
              <strong>Análise</strong>
              <span>
                Processa os dados e disponibiliza os estudos estatísticos.
              </span>
            </div>

            <div className="system-arrow">
              <ArrowRight size={20} />
            </div>

            <div className="system-card">
              <FileText size={24} />
              <strong>Relatório</strong>
              <span>
                Reúne os resultados e gera o documento final.
              </span>
            </div>

          </div>
        </section>


        <section className="doc-section">
          <h2>Principais recursos</h2>

          <ul>
            <li>Cadastro e gerenciamento de conjuntos.</li>
            <li>Cadastro e gerenciamento de peças.</li>
            <li>Importação de arquivos TXT de medição.</li>
            <li>Extração dos dados de medição.</li>
            <li>Geração e cálculo das análises estatísticas.</li>
            <li>Estudos de CP e CPK.</li>
            <li>Gráficos de controle.</li>
            <li>Estudos de Capability.</li>
            <li>Risk Assessment.</li>
            <li>Plano de ação.</li>
            <li>Histórico das análises.</li>
            <li>Montagem e exportação de relatórios em PDF.</li>
          </ul>
        </section>


        <section className="doc-section">
          <h2>Fluxo geral de utilização</h2>

          <ol>
            <li>Selecionar ou criar um conjunto.</li>
            <li>Criar ou selecionar uma peça.</li>
            <li>Importar os arquivos TXT.</li>
            <li>Extrair os dados dos arquivos.</li>
            <li>Criar um Job para o estudo.</li>
            <li>Gerar e calcular a análise da semana desejada.</li>
            <li>Consultar os indicadores estatísticos.</li>
            <li>Gerar os gráficos necessários.</li>
            <li>Realizar os estudos complementares.</li>
            <li>Salvar os resultados no Job.</li>
            <li>Montar o relatório.</li>
            <li>Exportar o PDF final.</li>
            <li>Encerrar o Job.</li>
          </ol>
        </section>


        <div className="doc-alert">
          <strong>Importante:</strong> o Job funciona como o identificador
          do estudo atual. Os gráficos salvos durante o processo são
          associados a esse Job e posteriormente podem ser utilizados
          no Report Builder.
        </div>


        <section className="doc-section">
          <h2>Próximo passo</h2>

          <p>
            Se você está utilizando o sistema pela primeira vez, comece
            pela página inicial e siga o fluxo apresentado no guia.
          </p>

          <Link
            href="/documentation/home-page"
            className="system-next-link"
          >
            Ir para Página Inicial
            <ArrowRight size={17} />
          </Link>
        </section>

      </div>
    </DocumentationLayout>
  );
}  
 
 