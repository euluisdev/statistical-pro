"use client";

import {
  ArrowDown,
  BarChart3,
  ClipboardList,
  FileText,
  FolderTree,
  LineChart,
  Package,
  Settings2,
  Table2,
} from "lucide-react";

import DocumentationLayout from "../components/DocumentationLayout";
import "../documentation.css";
import "./system.css";

export default function DocumentationSystemPage() {
  return (
    <DocumentationLayout>
      <div className="doc-page">

        {/* =====================================================
            CABEÇALHO
        ===================================================== */}

        <header className="doc-header">
          <h1>Visão Geral do Sistema</h1>

          <p>
            Entenda como as principais áreas do SIX SIGMA se conectam
            durante o processo de preparação dos dados, realização das
            análises estatísticas, acompanhamento dos resultados e
            construção do relatório final.
          </p>
        </header>


        {/* =====================================================
            1. COMO O SISTEMA ESTÁ ORGANIZADO
        ===================================================== */}

        <section className="doc-section">
          <h2>Como o SIX SIGMA está organizado?</h2>

          <p>
            O SIX SIGMA foi estruturado para que o usuário percorra uma
            sequência lógica durante a realização de um estudo.
          </p>

          <p>
            O processo começa pela organização das informações do estudo,
            passa pela entrada dos arquivos de medição e preparação dos
            dados e, posteriormente, disponibiliza diferentes recursos
            para análise e apresentação dos resultados.
          </p>

          <p>
            Dessa forma, cada etapa utiliza as informações preparadas
            anteriormente, evitando que o usuário precise organizar
            manualmente os mesmos dados em diferentes ferramentas.
          </p>

          <div className="doc-flow-overview">

            <div className="doc-flow-step">
              <FolderTree size={22} />
              <strong>Conjunto</strong>
              <span>Organização do estudo</span>
            </div>

            <div className="doc-flow-arrow">
              <ArrowDown size={20} />
            </div>

            <div className="doc-flow-step">
              <Package size={22} />
              <strong>Peça</strong>
              <span>Identificação do item analisado</span>
            </div>

            <div className="doc-flow-arrow">
              <ArrowDown size={20} />
            </div>

            <div className="doc-flow-step">
              <FileText size={22} />
              <strong>Arquivos TXT</strong>
              <span>Entrada dos dados de medição</span>
            </div>

            <div className="doc-flow-arrow">
              <ArrowDown size={20} />
            </div>

            <div className="doc-flow-step">
              <Table2 size={22} />
              <strong>Dados organizados</strong>
              <span>Preparação e visualização</span>
            </div>

            <div className="doc-flow-arrow">
              <ArrowDown size={20} />
            </div>

            <div className="doc-flow-step">
              <BarChart3 size={22} />
              <strong>Análises</strong>
              <span>Indicadores e gráficos</span>
            </div>

            <div className="doc-flow-arrow">
              <ArrowDown size={20} />
            </div>

            <div className="doc-flow-step">
              <ClipboardList size={22} />
              <strong>Resultados</strong>
              <span>Interpretação e acompanhamento</span>
            </div>

            <div className="doc-flow-arrow">
              <ArrowDown size={20} />
            </div>

            <div className="doc-flow-step">
              <FileText size={22} />
              <strong>Report Builder</strong>
              <span>Consolidação do estudo</span>
            </div>

          </div>
        </section>


        {/* =====================================================
            2. FLUXO COMPLETO
        ===================================================== */}

        <section className="doc-section">
          <h2>O fluxo completo de uma análise</h2>

          <p>
            De maneira simplificada, o processo pode ser representado
            da seguinte forma:
          </p>

          <div className="doc-flow-line">

            <div>
              <strong>1</strong>
              <span>Conjunto</span>
            </div>

            <ArrowDown size={18} />

            <div>
              <strong>2</strong>
              <span>Peça</span>
            </div>

            <ArrowDown size={18} />

            <div>
              <strong>3</strong>
              <span>TXT</span>
            </div>

            <ArrowDown size={18} />

            <div>
              <strong>4</strong>
              <span>Dados</span>
            </div>

            <ArrowDown size={18} />

            <div>
              <strong>5</strong>
              <span>Análise</span>
            </div>

            <ArrowDown size={18} />

            <div>
              <strong>6</strong>
              <span>Resultados</span>
            </div>

            <ArrowDown size={18} />

            <div>
              <strong>7</strong>
              <span>Relatório</span>
            </div>

          </div>

          <div className="doc-alert">
            <strong>Importante:</strong> cada etapa prepara informações
            para a etapa seguinte. Por isso, a organização inicial dos
            conjuntos, peças e arquivos é fundamental para que as análises
            posteriores sejam realizadas corretamente.
          </div>
        </section>


        {/* =====================================================
            3. CONJUNTO
        ===================================================== */}

        <section className="doc-section">
          <h2>1. Conjunto — organização do estudo</h2>

          <p>
            O conjunto funciona como uma estrutura de organização dentro
            do sistema. É nele que as peças relacionadas a determinado
            estudo são agrupadas.
          </p>

          <p>
            Essa organização permite separar diferentes estudos e manter
            seus respectivos dados estruturados dentro do sistema.
          </p>

          <h3>O conjunto representa o primeiro nível de organização</h3>

          <p>
            Antes de trabalhar com os arquivos de medição, o usuário deve
            estar dentro do conjunto correspondente ao estudo que deseja
            realizar.
          </p>

          <div className="doc-warning">
            <strong>Boa prática:</strong> mantenha uma nomenclatura
            consistente para os conjuntos. Isso facilita a localização
            dos estudos e a organização das informações.
          </div>
        </section>


        {/* =====================================================
            4. PEÇA
        ===================================================== */}

        <section className="doc-section">
          <h2>2. Peça — identificação do item analisado</h2>

          <p>
            Dentro de um conjunto, o usuário pode trabalhar com as peças
            que serão submetidas ao processo de análise.
          </p>

          <p>
            A peça estabelece o contexto dos arquivos de medição que serão
            importados e dos resultados que posteriormente serão analisados.
          </p>

          <h3>Relação entre conjunto e peça</h3>

          <table>
            <thead>
              <tr>
                <th>Nível</th>
                <th>Função</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Conjunto</td>
                <td>
                  Organiza o estudo e agrupa as peças relacionadas.
                </td>
              </tr>

              <tr>
                <td>Peça</td>
                <td>
                  Define o item cujos dados de medição serão analisados.
                </td>
              </tr>
            </tbody>
          </table>
        </section>


        {/* =====================================================
            5. TXT
        ===================================================== */}

        <section className="doc-section">
          <h2>3. Arquivos TXT — entrada dos dados</h2>

          <p>
            Depois de selecionar o conjunto e a peça, o próximo passo é
            inserir os arquivos de medição utilizados no estudo.
          </p>

          <p>
            O SIX SIGMA utiliza os arquivos TXT como fonte dos dados que
            serão processados posteriormente pelas análises.
          </p>

          <p>
            Durante esse processo, as informações contidas nos arquivos
            são extraídas e organizadas pelo sistema, permitindo que os
            dados sejam apresentados de forma estruturada para o usuário.
          </p>

          <div className="doc-alert">
            <strong>Objetivo desta etapa:</strong> transformar os arquivos
            de medição em dados estruturados que possam ser utilizados
            pelas etapas seguintes do sistema.
          </div>
        </section>


        {/* =====================================================
            6. DADOS / PIVOT TABLE
        ===================================================== */}

        <section className="doc-section">
          <h2>4. Organização dos dados e Pivot Table</h2>

          <p>
            Após a importação e processamento dos arquivos, os dados
            extraídos são apresentados de forma organizada para que o
            usuário possa visualizar as informações que serão utilizadas
            no estudo.
          </p>

          <p>
            A Pivot Table funciona como uma visão estruturada dos dados
            importados, permitindo observar as informações agrupadas e
            organizadas de acordo com os registros disponíveis.
          </p>

          <h3>Por que essa etapa é importante?</h3>

          <p>
            Antes de avançar para as análises estatísticas, é importante
            que o usuário tenha uma visão clara dos dados que foram
            carregados no sistema.
          </p>

          <p>
            Essa etapa funciona como uma ponte entre a entrada dos arquivos
            e as análises que serão realizadas posteriormente.
          </p>
        </section>


        {/* =====================================================
            7. ANÁLISES
        ===================================================== */}

        <section className="doc-section">
          <h2>5. Análises estatísticas</h2>

          <p>
            Com os dados preparados, o sistema disponibiliza diferentes
            áreas de análise estatística.
          </p>

          <p>
            As análises são acessadas a partir do contexto selecionado,
            considerando o conjunto e a peça que estão sendo trabalhados.
          </p>

          <h3>Entre os principais recursos de análise estão:</h3>

          <ul>
            <li>
              Análises estatísticas dos dados de medição.
            </li>

            <li>
              Indicadores de capacidade como CP e CPK.
            </li>

            <li>
              Gráficos de controle.
            </li>

            <li>
              Análises relacionadas ao comportamento e à capacidade do
              processo.
            </li>

            <li>
              Visualizações gráficas dos resultados.
            </li>
          </ul>

          <div className="doc-alert">
            <strong>Importante:</strong> a interpretação detalhada dos
            indicadores estatísticos e dos gráficos é apresentada na área
            de <strong>Conceitos</strong> e nas páginas específicas de
            análise.
          </div>
        </section>


        {/* =====================================================
            8. RESULTADOS
        ===================================================== */}

        <section className="doc-section">
          <h2>6. Visualização e interpretação dos resultados</h2>

          <p>
            As análises geradas pelo sistema permitem visualizar diferentes
            características dos dados e do processo estudado.
          </p>

          <p>
            Os resultados devem ser interpretados dentro do contexto do
            estudo, considerando os dados utilizados, os limites
            especificados e os indicadores apresentados.
          </p>

          <p>
            A documentação de conceitos estatísticos explica o significado
            de cada indicador e fornece o conhecimento necessário para
            interpretar corretamente os resultados apresentados pelo
            sistema.
          </p>
        </section>


        {/* =====================================================
            9. PLANO DE AÇÃO
        ===================================================== */}

        <section className="doc-section">
          <h2>7. Plano de Ação</h2>

          <p>
            Quando os resultados do estudo indicam a necessidade de
            acompanhamento ou intervenção, o sistema possui uma área
            destinada ao plano de ação.
          </p>

          <p>
            Essa etapa permite organizar as informações relacionadas às
            ações que precisam ser acompanhadas a partir dos resultados
            encontrados durante a análise.
          </p>

          <div className="doc-warning">
            <strong>Atenção:</strong> o plano de ação deve ser utilizado
            de acordo com o processo interno definido para acompanhamento
            das ocorrências e ações relacionadas ao estudo.
          </div>
        </section>


        {/* =====================================================
            10. REPORT BUILDER
        ===================================================== */}

        <section className="doc-section">
          <h2>8. Report Builder — consolidação do estudo</h2>

          <p>
            Depois de realizar as análises, o sistema disponibiliza o
            Report Builder para organizar os resultados que farão parte
            do relatório.
          </p>

          <p>
            O objetivo dessa etapa é reunir as informações produzidas
            durante o estudo em uma apresentação organizada, permitindo
            que o usuário construa o documento final a partir dos
            resultados selecionados.
          </p>

          <p>
            Dessa maneira, o Report Builder funciona como a etapa de
            consolidação do processo, conectando as análises realizadas
            ao resultado documental final.
          </p>
        </section>


        {/* =====================================================
            11. COMO AS PÁGINAS SE CONECTAM
        ===================================================== */}

        <section className="doc-section">
          <h2>Como as páginas se conectam?</h2>

          <table>
            <thead>
              <tr>
                <th>Área</th>
                <th>Função dentro do fluxo</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Página Inicial</td>
                <td>
                  Organizar conjuntos, peças e arquivos de medição.
                </td>
              </tr>

              <tr>
                <td>Análise</td>
                <td>
                  Acessar e gerar as análises estatísticas relacionadas
                  aos dados preparados.
                </td>
              </tr>

              <tr>
                <td>Plano de Ação</td>
                <td>
                  Registrar e acompanhar ações relacionadas aos resultados.
                </td>
              </tr>

              <tr>
                <td>Report Builder</td>
                <td>
                  Organizar os resultados para composição do relatório.
                </td>
              </tr>

              <tr>
                <td>Conceitos</td>
                <td>
                  Consultar explicações sobre os conceitos estatísticos
                  utilizados pelo sistema.
                </td>
              </tr>

              <tr>
                <td>Fluxos de Trabalho</td>
                <td>
                  Consultar procedimentos completos de utilização do sistema.
                </td>
              </tr>

              <tr>
                <td>Ajuda / FAQ</td>
                <td>
                  Encontrar respostas para dúvidas e situações comuns.
                </td>
              </tr>
            </tbody>
          </table>
        </section>


        {/* =====================================================
            12. RESUMO
        ===================================================== */}

        <section className="doc-section">
          <h2>Resumo do funcionamento</h2>

          <p>
            O SIX SIGMA pode ser entendido como uma sequência contínua:
          </p>

          <ol>
            <li>
              O estudo é organizado em um <strong>conjunto</strong>.
            </li>

            <li>
              A <strong>peça</strong> define o item que será analisado.
            </li>

            <li>
              Os <strong>arquivos TXT</strong> fornecem os dados de medição.
            </li>

            <li>
              Os dados são processados e apresentados de forma estruturada.
            </li>

            <li>
              As informações preparadas alimentam as
              <strong> análises estatísticas</strong>.
            </li>

            <li>
              Os resultados são apresentados por meio de
              <strong> indicadores e gráficos</strong>.
            </li>

            <li>
              Quando necessário, as informações podem ser utilizadas
              no <strong>Plano de Ação</strong>.
            </li>

            <li>
              Os resultados podem ser organizados no
              <strong> Report Builder</strong> para composição do relatório.
            </li>
          </ol>

          <div className="doc-alert">
            <strong>Em resumo:</strong> o sistema transforma os arquivos
            de medição utilizados no estudo em dados organizados, análises
            estatísticas, visualizações e resultados que podem ser
            consolidados em um relatório.
          </div>
        </section>


        {/* ======RODAPÉ===== */}

        <footer className="doc-footer">
          <p>
            Sistema SIX SIGMA — Documentação Interna
          </p>
        </footer>

      </div>
    </DocumentationLayout>
  );
}
 
 