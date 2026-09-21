"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  Filter,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

import DocumentationLayout from "../components/DocumentationLayout";
import "../documentation.css";
import "./action-plan.css";

export default function DocumentationActionPlanPage() {
  return (
    <DocumentationLayout>
      <div className="doc-page">

        <header className="doc-header">
          <h1>Plano de Ação</h1>

          <p>
            Utilize o Plano de Ação para registrar, acompanhar e controlar
            ações relacionadas aos pontos que necessitam de intervenção.
          </p>
        </header>


        <section className="doc-section">
          <h2>Quando utilizar?</h2>

          <p>
            O Plano de Ação deve ser utilizado quando os resultados da análise
            identificarem pontos que precisam de acompanhamento ou de uma ação
            específica.
          </p>

          <p>
            Os pontos podem ser filtrados de acordo com a classificação de
            CPK, facilitando a identificação daqueles que precisam ser
            analisados.
          </p>
        </section>


        <section className="doc-section">
          <h2>Criando um plano</h2>

          <ol>
            <li>Acesse o Plano de Ação.</li>
            <li>Selecione os pontos relacionados à ação.</li>
            <li>Defina o tipo de ação.</li>
            <li>Descreva a ação a ser executada.</li>
            <li>Informe o prazo, quando aplicável.</li>
            <li>Registre o acompanhamento semanal.</li>
            <li>Salve o plano.</li>
          </ol>
        </section>


        <section className="doc-section">
          <h2>Filtro de pontos</h2>

          <div className="action-feature">
            <Filter size={22} />

            <div>
              <strong>Filtro por CPK</strong>

              <p>
                Os pontos podem ser filtrados nas faixas:
              </p>

              <ul>
                <li>CPK &lt; 1,00</li>
                <li>1,00 ≤ CPK &lt; 1,33</li>
                <li>CPK ≥ 1,33</li>
              </ul>
            </div>
          </div>
        </section>


        <section className="doc-section">
          <h2>Acompanhamento semanal</h2>

          <div className="action-feature">
            <CalendarDays size={22} />

            <div>
              <strong>Controle por semana</strong>

              <p>
                O plano apresenta uma sequência de semanas para registrar
                o andamento da ação ao longo do tempo.
              </p>
            </div>
          </div>
        </section>


        <section className="doc-section">
          <h2>Gerenciamento</h2>

          <p>
            Os planos existentes podem ser consultados, editados e excluídos
            conforme a necessidade.
          </p>

          <p>
            Cada plano possui uma identificação sequencial para facilitar
            seu acompanhamento.
          </p>
        </section>


        <div className="doc-alert">
          <strong>Boa prática:</strong> descreva a ação de forma objetiva,
          indicando claramente o que será executado e, quando necessário,
          o responsável e o prazo definido pelo processo da empresa.
        </div>


        <div className="doc-page-navigation">
          <Link
            href="/documentation/analysis"
            className="doc-navigation-link"
          >
            ← Análise
          </Link>

          <Link
            href="/documentation/report-builder"
            className="doc-navigation-link doc-navigation-next"
          >
            Report Builder →
          </Link>
        </div>

      </div>
    </DocumentationLayout>
  );
}  
 
 