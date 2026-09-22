"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  FileChartColumn,
  FileText,
  FolderTree,
  Gauge,
  LineChart,
  Target,
  Workflow,
} from "lucide-react";

import DocumentationLayout from "./components/DocumentationLayout";
import "./documentation.css";

export default function DocumentationHomePage() {
  return (
    <DocumentationLayout>
      <div className="doc-page">

        {/* ==========CABEÇALHO============= */}

        <header className="doc-header">
          <h1>Apresentação | SIX SIGMA</h1>

          <p>
            Conheça o sistema de análise estatística SIX SIGMA,
            seus principais recursos, resultados e o fluxo completo
            utilizado para transformar dados de medição em informações
            para análise e tomada de decisão.
          </p>
        </header>


        {/* =====================================================
            1. O QUE É O SISTEMA?
        ===================================================== */}

        <section className="doc-section">
          <h2>O que é o SIX SIGMA?</h2>

          <p>
            O SIX SIGMA é uma aplicação desenvolvida internamente para
            centralizar, organizar e automatizar etapas do processo de
            análise estatística aplicado aos estudos de medição e
            capabilidade.
          </p>

          <p>
            O sistema reúne em uma única plataforma etapas que anteriormente
            dependiam de diferentes arquivos, ferramentas e processos
            manuais, permitindo que os dados sejam organizados desde a
            entrada dos arquivos de medição até a geração dos resultados
            e do relatório final.
          </p>

          <p>
            Seu objetivo é proporcionar um processo mais padronizado,
            rastreável e estruturado para a realização dos estudos,
            reduzindo atividades manuais e facilitando a interpretação
            dos resultados.
          </p>
        </section>


        {/* =====================================================
            2. OBJETIVO
        ===================================================== */}

        <section className="doc-section">
          <h2>Qual é o objetivo do sistema?</h2>

          <p>
            O SIX SIGMA foi desenvolvido para apoiar o processo de análise
            estatística, desde a organização dos dados até a construção
            dos resultados utilizados nos estudos.
          </p>

          <p>
            Entre os principais objetivos estão:
          </p>

          <ul>
            <li>
              Centralizar as informações dos estudos em uma única aplicação.
            </li>

            <li>
              Padronizar o processo de análise estatística.
            </li>

            <li>
              Reduzir atividades manuais durante a preparação dos estudos.
            </li>

            <li>
              Automatizar cálculos e geração de indicadores estatísticos.
            </li>

            <li>
              Facilitar a visualização e interpretação dos resultados.
            </li>

            <li>
              Organizar o histórico dos estudos realizados.
            </li>

            <li>
              Facilitar a construção e exportação dos relatórios.
            </li>
          </ul>
        </section>


        {/* =====================================================
            3. CAPACIDADES DO SISTEMA
        ===================================================== */}

        <section className="doc-section">
          <h2>O que o sistema é capaz de fazer?</h2>

          <p>
            O SIX SIGMA reúne diferentes etapas do processo de análise
            estatística em um único fluxo de trabalho.
          </p>

          <p>
            De forma geral, o sistema permite:
          </p>

          <ul>
            <li>
              Criar e organizar conjuntos de análise.
            </li>

            <li>
              Cadastrar e gerenciar peças relacionadas aos conjuntos.
            </li>

            <li>
              Importar arquivos de medição gerados pelas máquinas.
            </li>

            <li>
              Organizar os dados de medição utilizados nos estudos.
            </li>

            <li>
              Gerar análises estatísticas a partir dos dados importados.
            </li>

            <li>
              Calcular e apresentar indicadores de capacidade e
              desempenho do processo.
            </li>

            <li>
              Gerar gráficos estatísticos para acompanhamento dos dados.
            </li>

            <li>
              Consultar históricos e resultados de estudos anteriores.
            </li>

            <li>
              Registrar e acompanhar informações relacionadas ao plano
              de ação.
            </li>

            <li>
              Organizar os resultados selecionados para composição do
              relatório.
            </li>

            <li>
              Exportar o resultado final em formato PDF.
            </li>
          </ul>
        </section>


        {/* =====================================================
            4. PRINCIPAIS RESULTADOS
        ===================================================== */}

        <section className="doc-section">
          <h2>Quais resultados podem ser gerados?</h2>

          <p>
            A partir dos dados de medição inseridos no sistema, diferentes
            análises e representações estatísticas podem ser utilizadas
            para avaliar o comportamento e a capacidade dos processos.
          </p>

          <table>
            <thead>
              <tr>
                <th>Resultado</th>
                <th>Finalidade</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Indicadores estatísticos</td>
                <td>
                  Avaliar características estatísticas dos dados utilizados
                  no estudo.
                </td>
              </tr>

              <tr>
                <td>CP / CPK</td>
                <td>
                  Avaliar a capacidade do processo em relação aos limites
                  especificados.
                </td>
              </tr>

              <tr>
                <td>Gráficos de Controle</td>
                <td>
                  Visualizar o comportamento dos dados e acompanhar sua
                  variação ao longo das medições.
                </td>
              </tr>

              <tr>
                <td>Gráficos de tendência</td>
                <td>
                  Acompanhar a evolução dos resultados ao longo do histórico
                  disponível.
                </td>
              </tr>

              <tr>
                <td>Plano de Ação</td>
                <td>
                  Registrar e acompanhar ações relacionadas aos resultados
                  identificados durante os estudos.
                </td>
              </tr>

              <tr>
                <td>Relatório PDF</td>
                <td>
                  Consolidar os resultados selecionados em um documento
                  final para utilização e compartilhamento.
                </td>
              </tr>
            </tbody>
          </table>
        </section>


        {/* =====================================================
            5. FLUXO GERAL
        ===================================================== */}

        <section className="doc-section">
          <h2>Como funciona o fluxo geral?</h2>

          <p>
            O funcionamento do sistema pode ser entendido como uma sequência
            de etapas. Cada etapa prepara as informações necessárias para
            a próxima.
          </p>

          <ol>
            <li>
              <strong>Organização:</strong> criação ou seleção do conjunto
              que será analisado.
            </li>

            <li>
              <strong>Cadastro:</strong> criação ou seleção das peças
              relacionadas ao conjunto.
            </li>

            <li>
              <strong>Entrada de dados:</strong> importação dos arquivos
              de medição.
            </li>

            <li>
              <strong>Preparação:</strong> organização e validação dos
              dados utilizados na análise.
            </li>

            <li>
              <strong>Análise:</strong> geração dos cálculos e indicadores
              estatísticos.
            </li>

            <li>
              <strong>Visualização:</strong> geração dos gráficos e
              representações dos resultados.
            </li>

            <li>
              <strong>Acompanhamento:</strong> consulta do histórico e
              registro de ações quando necessário.
            </li>

            <li>
              <strong>Relatório:</strong> organização dos resultados e
              geração do documento final.
            </li>
          </ol>

          <div className="doc-alert">
            <strong>Importante:</strong> a documentação detalhada de cada
            etapa está disponível nas páginas específicas deste guia.
            Esta página apresenta apenas uma visão geral do processo.
          </div>
        </section>


        {/* =====================================================
            6. ÁREAS DA DOCUMENTAÇÃO
        ===================================================== */}

        <section className="doc-section">
          <h2>Conheça as áreas do sistema</h2>

          <p>
            Cada página da documentação aborda uma etapa ou recurso
            específico do SIX SIGMA.
          </p>

          <ul>
            <li>
              <strong>Página Inicial:</strong> gerenciamento de conjuntos,
              peças e arquivos de medição.
            </li>

            <li>
              <strong>Análise:</strong> geração e visualização das análises
              estatísticas.
            </li>

            <li>
              <strong>Plano de Ação:</strong> acompanhamento das ações
              relacionadas aos resultados.
            </li>

            <li>
              <strong>Report Builder:</strong> organização dos resultados
              e geração do relatório final.
            </li>

            <li>
              <strong>Fluxos de Trabalho:</strong> procedimentos completos
              para execução das atividades no sistema.
            </li>

            <li>
              <strong>Conceitos:</strong> explicação dos principais conceitos
              estatísticos utilizados nas análises.
            </li>

            <li>
              <strong>Ajuda / FAQ:</strong> dúvidas frequentes e orientações
              para situações comuns durante a utilização.
            </li>
          </ul>
        </section>


        {/* =====================================================
            7. RESULTADO FINAL
        ===================================================== */}

        <section className="doc-section">
          <h2>O que o usuário obtém ao final?</h2>

          <p>
            O objetivo do fluxo não é apenas gerar gráficos isolados.
            O sistema permite construir um estudo organizado, partindo
            dos dados de medição e chegando aos resultados estatísticos
            e ao relatório final.
          </p>

          <p>
            Dessa forma, o usuário consegue reunir em um mesmo processo
            os dados utilizados, as análises realizadas, os indicadores
            obtidos, os gráficos gerados e as informações necessárias
            para documentar o estudo.
          </p>

          <div className="doc-warning">
            <strong>Próximo passo:</strong> se você está utilizando o
            sistema pela primeira vez, consulte a página
            <strong> Página Inicial</strong> para conhecer detalhadamente
            o procedimento de criação de conjuntos, cadastro de peças,
            importação dos arquivos e preparação dos dados para análise.
          </div>
        </section>

        {/* ========RODAPÉ======= */}

        <footer className="doc-footer">
          <p>
            Sistema SIX SIGMA | Documentação Interna
          </p>
        </footer>

      </div>
    </DocumentationLayout>
  );
}

  
 