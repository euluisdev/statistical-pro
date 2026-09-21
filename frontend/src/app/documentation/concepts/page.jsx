"use client";

import Link from "next/link";
import {
  BookOpen,
  Calculator,
  Activity,
  Gauge,
  ArrowRight,
} from "lucide-react";

import DocumentationLayout from "../components/DocumentationLayout";
import "../documentation.css";
import "./concepts.css";

export default function DocumentationConceptsPage() {
  return (
    <DocumentationLayout>
      <div className="doc-page">

        <header className="doc-header">
          <h1>Conceitos Estatísticos</h1>

          <p>
            Consulte os principais conceitos utilizados nas análises
            estatísticas do SIX SIGMA e entenda como interpretar os
            resultados apresentados pelo sistema.
          </p>
        </header>


        <section className="doc-section">
          <h2>CP</h2>

          <div className="concept-box">
            <Calculator size={24} />

            <div>
              <strong>Índice de capacidade potencial</strong>

              <p>
                O CP relaciona a largura da especificação com a dispersão
                do processo.
              </p>

              <div className="formula">
                Cp = (LSE − LIE) / (6σ)
              </div>

              <p>
                O indicador considera a variabilidade do processo em relação
                aos limites de especificação.
              </p>
            </div>
          </div>
        </section>


        <section className="doc-section">
          <h2>CPK</h2>

          <div className="concept-box">
            <Gauge size={24} />

            <div>
              <strong>Índice de capacidade considerando a centralização</strong>

              <p>
                O CPK considera, além da dispersão, a posição média do
                processo em relação aos limites de especificação.
              </p>

              <div className="formula">
                Cpk = min[(LSE − μ) / (3σ), (μ − LIE) / (3σ)]
              </div>
            </div>
          </div>
        </section>


        <section className="doc-section">
          <h2>Faixas utilizadas no sistema</h2>

          <table>
            <thead>
              <tr>
                <th>Faixa</th>
                <th>Classificação utilizada</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>≥ 1,33</td>
                <td>Faixa superior</td>
              </tr>

              <tr>
                <td>≥ 1,00 e &lt; 1,33</td>
                <td>Faixa intermediária</td>
              </tr>

              <tr>
                <td>&lt; 1,00</td>
                <td>Faixa inferior</td>
              </tr>
            </tbody>
          </table>
        </section>


        <section className="doc-section">
          <h2>Gráfico de controle</h2>

          <div className="concept-box">
            <Activity size={24} />

            <div>
              <strong>Control Chart</strong>

              <p>
                O gráfico de controle permite acompanhar o comportamento
                dos dados ao longo do processo e identificar padrões ou
                pontos que merecem investigação.
              </p>
            </div>
          </div>
        </section>


        <section className="doc-section">
          <h2>Capabilidade × Controle</h2>

          <p>
            Os conceitos não representam exatamente a mesma análise.
          </p>

          <ul>
            <li>
              <strong>Capabilidade:</strong> avalia a relação entre a
              variabilidade do processo e os limites de especificação.
            </li>

            <li>
              <strong>Controle:</strong> acompanha o comportamento do
              processo ao longo do tempo.
            </li>
          </ul>
        </section>


        <section className="doc-section">
          <h2>Como interpretar os resultados?</h2>

          <p>
            Os indicadores devem ser analisados em conjunto com os dados,
            limites de especificação, comportamento temporal e contexto
            do processo.
          </p>

          <div className="doc-warning">
            Os valores apresentados pelo sistema são ferramentas de apoio
            à análise. A interpretação deve considerar o contexto técnico
            do estudo.
          </div>
        </section>


        <div className="doc-page-navigation">
          <Link
            href="/documentation/workflows"
            className="doc-navigation-link"
          >
            ← Fluxos
          </Link>

          <Link
            href="/documentation/help"
            className="doc-navigation-link doc-navigation-next"
          >
            Ajuda / FAQ →
          </Link>
        </div>

      </div>
    </DocumentationLayout>
  );
}  
 
 