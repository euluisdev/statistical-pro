"use client";

import Link from "next/link";
import {
  Play,
  Upload,
  BarChart3,
  FileText,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import DocumentationLayout from "../components/DocumentationLayout";
import "../documentation.css";
import "./workflows.css";

export default function DocumentationWorkflowsPage() {
  return (
    <DocumentationLayout>
      <div className="doc-page">

        <header className="doc-header">
          <h1>Fluxos de Trabalho</h1>

          <p>
            Consulte o procedimento recomendado para executar uma análise
            completa no SIX SIGMA, desde a preparação dos dados até a
            geração do relatório final.
          </p>
        </header>


        <section className="doc-section">
          <h2>Fluxo completo</h2>

          <div className="workflow">

            <div className="workflow-step">
              <span>01</span>
              <Play size={20} />
              <strong>Preparar o estudo</strong>
              <p>
                Selecione ou crie o conjunto e a peça.
              </p>
            </div>

            <div className="workflow-step">
              <span>02</span>
              <Upload size={20} />
              <strong>Importar dados</strong>
              <p>
                Importe os arquivos TXT gerados pela medição.
              </p>
            </div>

            <div className="workflow-step">
              <span>03</span>
              <BarChart3 size={20} />
              <strong>Gerar análise</strong>
              <p>
                Selecione a semana e gere os indicadores.
              </p>
            </div>

            <div className="workflow-step">
              <span>04</span>
              <BarChart3 size={20} />
              <strong>Realizar estudos</strong>
              <p>
                Consulte os gráficos e estudos estatísticos.
              </p>
            </div>

            <div className="workflow-step">
              <span>05</span>
              <CheckCircle2 size={20} />
              <strong>Registrar ações</strong>
              <p>
                Utilize Risk Assessment e Plano de Ação quando aplicável.
              </p>
            </div>

            <div className="workflow-step">
              <span>06</span>
              <FileText size={20} />
              <strong>Montar relatório</strong>
              <p>
                Organize os resultados no Report Builder.
              </p>
            </div>

          </div>
        </section>


        <section className="doc-section">
          <h2>Fluxo operacional detalhado</h2>

          <h3>1. Preparação</h3>

          <ol>
            <li>Abra a Página Inicial.</li>
            <li>Selecione ou crie o conjunto.</li>
            <li>Selecione ou cadastre a peça.</li>
          </ol>


          <h3>2. Importação</h3>

          <ol>
            <li>Selecione os arquivos TXT.</li>
            <li>Envie os arquivos para a peça.</li>
            <li>Confira a lista de arquivos importados.</li>
            <li>Execute a extração dos dados.</li>
          </ol>


          <h3>3. Análise</h3>

          <ol>
            <li>Crie o Job do estudo.</li>
            <li>Acesse a análise da peça.</li>
            <li>Selecione ano e semana.</li>
            <li>Gere e calcule a análise.</li>
            <li>Confira o resumo dos resultados.</li>
          </ol>


          <h3>4. Estudos</h3>

          <ol>
            <li>Analise CG.</li>
            <li>Analise CP/CPK.</li>
            <li>Consulte os gráficos por conjunto quando necessário.</li>
            <li>Consulte o Control Chart.</li>
            <li>Realize o estudo de Capability.</li>
            <li>Consulte o Risk Assessment.</li>
          </ol>


          <h3>5. Ações</h3>

          <ol>
            <li>Identifique os pontos que precisam de intervenção.</li>
            <li>Crie o Plano de Ação.</li>
            <li>Defina a ação.</li>
            <li>Registre o acompanhamento.</li>
          </ol>


          <h3>6. Relatório</h3>

          <ol>
            <li>Salve os gráficos necessários no Job.</li>
            <li>Acesse o Report Builder.</li>
            <li>Monte as páginas.</li>
            <li>Revise o documento.</li>
            <li>Exporte o PDF.</li>
          </ol>


          <h3>7. Encerramento</h3>

          <ol>
            <li>Confirme que o relatório foi gerado corretamente.</li>
            <li>Finalize o Job.</li>
          </ol>
        </section>


        <div className="doc-warning">
          <strong>Atenção:</strong> não encerre o Job antes de concluir
          a montagem do relatório caso ainda existam gráficos que serão
          utilizados pelo Report Builder.
        </div>


        <div className="doc-page-navigation">
          <Link
            href="/documentation/report-builder"
            className="doc-navigation-link"
          >
            ← Report Builder
          </Link>

          <Link
            href="/documentation/concepts"
            className="doc-navigation-link doc-navigation-next"
          >
            Conceitos →
          </Link>
        </div>

      </div>
    </DocumentationLayout>
  );
}  
 
 