"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ChartLine,
  Gauge,
  FileText,
  Activity,
  ShieldAlert,
} from "lucide-react";

import DocumentationLayout from "../components/DocumentationLayout";
import "../documentation.css";
import "./analysis.css";

export default function DocumentationAnalysisPage() {
  return (
    <DocumentationLayout>
      <div className="doc-page">

        <header className="doc-header">
          <h1>Análise Estatística</h1>

          <p>
            Entenda como gerar a análise de uma semana, consultar o histórico
            e acessar os diferentes estudos estatísticos disponíveis para
            uma peça.
          </p>
        </header>


        <section className="doc-section">
          <h2>Objetivo da análise</h2>

          <p>
            A página de análise é o ponto central dos estudos estatísticos
            de uma peça.
          </p>

          <p>
            A partir dos arquivos de medição importados, o sistema gera os
            dados da semana selecionada e calcula os indicadores utilizados
            nas análises posteriores.
          </p>
        </section>


        <section className="doc-section">
          <h2>Selecionando período</h2>

          <p>
            Utilize os campos <strong>YEAR</strong> e <strong>WEEK</strong>
            para selecionar o período que será analisado.
          </p>

          <div className="doc-warning">
            A semana selecionada deve possuir dados de medição disponíveis
            para que a análise possa ser gerada.
          </div>
        </section>


        <section className="doc-section">
          <h2>Gerando a análise</h2>

          <ol>
            <li>Selecione o ano.</li>
            <li>Selecione a semana.</li>
            <li>Clique no botão de geração/cálculo.</li>
            <li>Aguarde a geração dos dados.</li>
            <li>Aguarde o cálculo das estatísticas.</li>
            <li>Confira o resumo apresentado.</li>
          </ol>

          <p>
            O processamento ocorre em duas etapas: primeiro os dados da
            análise são gerados e depois os indicadores estatísticos são
            calculados.
          </p>
        </section>


        <section className="doc-section">
          <h2>Histórico</h2>

          <p>
            Quando existem análises previamente geradas, o sistema apresenta
            as semanas disponíveis no histórico.
          </p>

          <p>
            Clique em uma semana do histórico para selecionar aquele período
            novamente.
          </p>
        </section>


        <section className="doc-section">
          <h2>Estudos disponíveis</h2>

          <div className="analysis-grid">

            <div className="analysis-card">
              <Activity size={22} />
              <strong>CG</strong>
              <span>
                Analisa o comportamento dos dados ao longo das semanas.
              </span>
            </div>

            <div className="analysis-card">
              <Gauge size={22} />
              <strong>CP / CPK</strong>
              <span>
                Apresenta indicadores relacionados à capacidade do processo.
              </span>
            </div>

            <div className="analysis-card">
              <BarChart3 size={22} />
              <strong>Gráficos por Conjunto</strong>
              <span>
                Permitem visualizar informações agregadas entre peças.
              </span>
            </div>

            <div className="analysis-card">
              <Activity size={22} />
              <strong>Control Chart</strong>
              <span>
                Permite avaliar o comportamento estatístico dos pontos.
              </span>
            </div>

            <div className="analysis-card">
              <Gauge size={22} />
              <strong>Capability</strong>
              <span>
                Permite organizar o estudo de capacidade da peça.
              </span>
            </div>

            <div className="analysis-card">
              <ShieldAlert size={22} />
              <strong>Risk Assessment</strong>
              <span>
                Apresenta a avaliação de risco associada aos resultados.
              </span>
            </div>

            <div className="analysis-card">
              <ChartLine size={22} />
              <strong>Plano de Ação</strong>
              <span>
                Permite registrar ações relacionadas aos pontos identificados.
              </span>
            </div>

            <div className="analysis-card">
              <FileText size={22} />
              <strong>Report Builder</strong>
              <span>
                Permite montar o relatório final.
              </span>
            </div>

          </div>
        </section>


        <section className="doc-section">
          <h2>Resumo dos resultados</h2>

          <p>
            Após o cálculo, a página apresenta um resumo dos indicadores
            encontrados nos dados analisados.
          </p>

          <p>
            Os valores de CP e CPK são classificados em faixas para facilitar
            a identificação dos pontos que precisam de atenção.
          </p>
        </section>


        <div className="doc-alert">
          <strong>Dica:</strong> gere a análise antes de acessar os estudos
          que dependem dos dados estatísticos da semana.
        </div>


        <div className="doc-page-navigation">
          <Link
            href="/documentation/home-page"
            className="doc-navigation-link"
          >
            ← Página Inicial
          </Link>

          <Link
            href="/documentation/action-plan"
            className="doc-navigation-link doc-navigation-next"
          >
            Plano de Ação →
          </Link>
        </div>

      </div>
    </DocumentationLayout>
  );
}  
 
 