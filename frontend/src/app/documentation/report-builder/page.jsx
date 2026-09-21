"use client";

import Link from "next/link";
import {
  FileText,
  MousePointer2,
  Layers,
  Download,
  Save,
  LayoutTemplate,
  ArrowRight,
} from "lucide-react";

import DocumentationLayout from "../components/DocumentationLayout";
import "../documentation.css";
import "./report-builder.css";

export default function DocumentationReportBuilderPage() {
  return (
    <DocumentationLayout>
      <div className="doc-page">

        <header className="doc-header">
          <h1>Report Builder</h1>

          <p>
            Monte o relatório final utilizando os gráficos salvos no Job,
            organizando páginas, textos e elementos antes da exportação
            para PDF.
          </p>
        </header>


        <section className="doc-section">
          <h2>Pré-requisito</h2>

          <div className="doc-warning">
            É necessário possuir um <strong>Job ativo</strong> para utilizar
            os gráficos armazenados durante o estudo.
          </div>

          <p>
            Os gráficos salvos nas páginas de análise são associados ao Job.
            O Report Builder consulta esses arquivos para disponibilizá-los
            na biblioteca do relatório.
          </p>
        </section>


        <section className="doc-section">
          <h2>Elementos principais</h2>

          <div className="report-grid">

            <div className="report-card">
              <Layers size={22} />
              <strong>Biblioteca</strong>
              <span>
                Lista os gráficos disponíveis no Job.
              </span>
            </div>

            <div className="report-card">
              <MousePointer2 size={22} />
              <strong>Canvas</strong>
              <span>
                Área utilizada para posicionar os elementos.
              </span>
            </div>

            <div className="report-card">
              <FileText size={22} />
              <strong>Texto</strong>
              <span>
                Permite adicionar informações ao relatório.
              </span>
            </div>

            <div className="report-card">
              <LayoutTemplate size={22} />
              <strong>Template</strong>
              <span>
                Permite trabalhar com layouts salvos.
              </span>
            </div>

          </div>
        </section>


        <section className="doc-section">
          <h2>Montando o relatório</h2>

          <ol>
            <li>Confirme que existe um Job ativo.</li>
            <li>Acesse o Report Builder.</li>
            <li>Consulte os gráficos disponíveis na biblioteca.</li>
            <li>Arraste os gráficos para o canvas.</li>
            <li>Adicione textos quando necessário.</li>
            <li>Organize os elementos na página.</li>
            <li>Adicione ou remova páginas conforme necessário.</li>
            <li>Defina a orientação da página.</li>
            <li>Revise o relatório completo.</li>
            <li>Exporte o PDF.</li>
          </ol>
        </section>


        <section className="doc-section">
          <h2>Salvamento automático</h2>

          <div className="report-feature">
            <Save size={22} />

            <div>
              <strong>Auto-save</strong>

              <p>
                O layout do relatório é salvo automaticamente durante
                a edição.
              </p>
            </div>
          </div>
        </section>


        <section className="doc-section">
          <h2>Templates</h2>

          <p>
            O sistema permite salvar estados do relatório como snapshots
            nomeados e posteriormente carregá-los novamente.
          </p>

          <p>
            Isso permite reutilizar uma estrutura de relatório sem precisar
            reconstruir toda a disposição dos elementos manualmente.
          </p>
        </section>


        <section className="doc-section">
          <h2>Exportação</h2>

          <div className="report-feature">
            <Download size={22} />

            <div>
              <strong>PDF</strong>

              <p>
                Utilize o botão de exportação para gerar o documento final
                em formato PDF.
              </p>
            </div>
          </div>
        </section>


        <div className="doc-alert">
          <strong>Antes de exportar:</strong> percorra todas as páginas e
          confirme se os gráficos, textos, títulos e demais informações
          estão posicionados corretamente.
        </div>


        <div className="doc-page-navigation">
          <Link
            href="/documentation/action-plan"
            className="doc-navigation-link"
          >
            ← Plano de Ação
          </Link>

          <Link
            href="/documentation/workflows"
            className="doc-navigation-link doc-navigation-next"
          >
            Fluxos de Trabalho →
          </Link>
        </div>

      </div>
    </DocumentationLayout>
  );
}  
 
 