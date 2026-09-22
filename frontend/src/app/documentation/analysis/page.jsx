"use client";

import {
  BarChart3,
  CheckCircle2,
  FileText,
  Gauge,
  LineChart,
  Target,
  TrendingUp,
} from "lucide-react";

import DocumentationLayout from "../components/DocumentationLayout";
import "../documentation.css";
import "./analysis.css";

export default function DocumentationAnalysisPage() {
  return (
    <DocumentationLayout>
      <div className="doc-page">

        {/* =====================================================
            CABEÇALHO
        ===================================================== */}

        <header className="doc-header">
          <h1>Análise Estatística</h1>

          <p>
            Entenda como o SIX SIGMA utiliza os dados preparados na Página
            Inicial para gerar indicadores estatísticos, gráficos e
            resultados utilizados na avaliação dos estudos.
          </p>
        </header>


        {/* =====================================================
            1. OBJETIVO
        ===================================================== */}

        <section className="doc-section">
          <h2>1. Objetivo da análise</h2>

          <p>
            A área de Análise é responsável por transformar os dados de
            medição preparados anteriormente em informações estatísticas
            que podem ser utilizadas para avaliar o comportamento e a
            capacidade do processo.
          </p>

          <p>
            A partir dos dados importados e organizados na Página Inicial,
            o sistema disponibiliza diferentes recursos para visualização,
            cálculo e acompanhamento dos resultados.
          </p>

          <p>
            Cada recurso possui uma finalidade específica e, em conjunto,
            permite construir uma visão mais completa do estudo.
          </p>

          <div className="doc-alert">
            <strong>Pré-requisito:</strong> antes de iniciar uma análise,
            certifique-se de que o conjunto, a peça e os arquivos de
            medição corretos foram selecionados e processados na Página
            Inicial.
          </div>
        </section>


        {/* =====================================================
            2. VISÃO GERAL
        ===================================================== */}

        <section className="doc-section">
          <h2>2. Recursos disponíveis</h2>

          <p>
            A área de análise reúne diferentes recursos estatísticos e
            gráficos. Cada um deles apresenta uma perspectiva diferente
            sobre os dados do estudo.
          </p>

          <div className="analysis-resource-list">

            <div className="analysis-resource">
              <div className="analysis-resource-icon">
                <BarChart3 size={21} />
              </div>

              <div>
                <strong>Análise Estatística</strong>

                <span>
                  Apresentação dos principais indicadores calculados a
                  partir dos dados de medição.
                </span>
              </div>
            </div>


            <div className="analysis-resource">
              <div className="analysis-resource-icon">
                <Gauge size={21} />
              </div>

              <div>
                <strong>Capability / CP / CPK</strong>

                <span>
                  Avaliação da capacidade do processo em relação aos
                  limites especificados.
                </span>
              </div>
            </div>


            <div className="analysis-resource">
              <div className="analysis-resource-icon">
                <LineChart size={21} />
              </div>

              <div>
                <strong>Gráfico de Controle</strong>

                <span>
                  Visualização da variação dos dados ao longo das medições
                  e acompanhamento do comportamento do processo.
                </span>
              </div>
            </div>


            <div className="analysis-resource">
              <div className="analysis-resource-icon">
                <TrendingUp size={21} />
              </div>

              <div>
                <strong>Tendência</strong>

                <span>
                  Visualização da evolução dos resultados ao longo do
                  período analisado.
                </span>
              </div>
            </div>


            <div className="analysis-resource">
              <div className="analysis-resource-icon">
                <Target size={21} />
              </div>

              <div>
                <strong>Risk Assessment</strong>

                <span>
                  Recurso utilizado para organizar e avaliar informações
                  relacionadas aos riscos identificados no estudo.
                </span>
              </div>
            </div>

          </div>
        </section>


        {/* =====================================================
            3. PREPARAÇÃO
        ===================================================== */}

        <section className="doc-section">
          <h2>3. Antes de iniciar uma análise</h2>

          <p>
            A qualidade dos resultados depende diretamente dos dados que
            foram preparados nas etapas anteriores.
          </p>

          <p>
            Antes de acessar os recursos de análise, verifique:
          </p>

          <ul>
            <li>
              O conjunto correto está selecionado.
            </li>

            <li>
              A peça correta está selecionada.
            </li>

            <li>
              Os arquivos TXT necessários foram importados.
            </li>

            <li>
              Os dados foram extraídos corretamente.
            </li>

            <li>
              A Pivot Table apresenta os dados esperados.
            </li>
          </ul>

          <div className="doc-warning">
            <strong>Atenção:</strong> uma análise estatística não corrige
            automaticamente uma entrada de dados incorreta. Sempre
            verifique os dados antes de interpretar os resultados.
          </div>
        </section>


        {/* =====================================================
            4. ANÁLISE ESTATÍSTICA
        ===================================================== */}

        <section className="doc-section">
          <h2>4. Análise estatística</h2>

          <p>
            A análise estatística apresenta informações calculadas a
            partir dos dados de medição selecionados para o estudo.
          </p>

          <p>
            Esses resultados permitem observar características importantes
            do conjunto de dados e servem como base para as demais
            representações estatísticas disponibilizadas pelo sistema.
          </p>

          <h3>O que observar?</h3>

          <ul>
            <li>
              Quantidade de dados utilizados.
            </li>

            <li>
              Valores médios e medidas estatísticas apresentadas.
            </li>

            <li>
              Variação existente entre as medições.
            </li>

            <li>
              Limites de especificação utilizados no estudo.
            </li>

            <li>
              Indicadores de capacidade e desempenho.
            </li>
          </ul>

          <div className="doc-alert">
            <strong>Importante:</strong> os indicadores apresentados devem
            ser interpretados considerando o contexto do estudo e os
            limites de especificação definidos para a característica
            analisada.
          </div>
        </section>


        {/* =====================================================
            5. CAPABILITY
        ===================================================== */}

        <section className="doc-section">
          <h2>5. Capability</h2>

          <p>
            A análise de Capability apresenta uma representação gráfica
            da distribuição dos dados em relação aos limites de
            especificação.
          </p>

          <p>
            O objetivo é permitir uma visualização da posição e da
            distribuição das medições em relação à região especificada
            para a característica analisada.
          </p>

          <h3>Informações apresentadas</h3>

          <table>
            <thead>
              <tr>
                <th>Informação</th>
                <th>Finalidade</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Distribuição dos dados</td>
                <td>
                  Permite visualizar como os valores estão distribuídos.
                </td>
              </tr>

              <tr>
                <td>Limite inferior</td>
                <td>
                  Representa o limite inferior de especificação utilizado
                  na análise.
                </td>
              </tr>

              <tr>
                <td>Limite superior</td>
                <td>
                  Representa o limite superior de especificação utilizado
                  na análise.
                </td>
              </tr>

              <tr>
                <td>CP</td>
                <td>
                  Indicador relacionado à capacidade potencial do processo.
                </td>
              </tr>

              <tr>
                <td>CPK</td>
                <td>
                  Indicador que considera a capacidade do processo em
                  relação à sua centralização.
                </td>
              </tr>
            </tbody>
          </table>

          <div className="doc-alert">
            Para entender matematicamente os índices CP e CPK e a
            interpretação dos seus valores, consulte a seção
            <strong> Conceitos</strong>.
          </div>
        </section>


        {/* =====================================================
            6. CP / CPK
        ===================================================== */}

        <section className="doc-section">
          <h2>6. Interpretação visual de CP e CPK</h2>

          <p>
            O sistema utiliza uma indicação visual para facilitar a
            identificação da faixa em que os indicadores de capacidade
            se encontram.
          </p>

          <div className="cpk-guide">

            <div className="cpk-guide-item">
              <CheckCircle2 size={20} />

              <div>
                <strong>CP / CPK ≥ 1,33</strong>

                <span>
                  Faixa apresentada pelo sistema como resultado adequado
                  segundo o critério visual configurado.
                </span>
              </div>
            </div>


            <div className="cpk-guide-item">
              <div className="cpk-guide-symbol">
                !
              </div>

              <div>
                <strong>1,00 ≤ CP / CPK &lt; 1,33</strong>

                <span>
                  Faixa intermediária apresentada pelo sistema e que
                  merece atenção na interpretação do estudo.
                </span>
              </div>
            </div>


            <div className="cpk-guide-item">
              <div className="cpk-guide-symbol">
                !
              </div>

              <div>
                <strong>CP / CPK &lt; 1,00</strong>

                <span>
                  Faixa apresentada pelo sistema como indicativa de
                  resultado abaixo do critério configurado.
                </span>
              </div>
            </div>

          </div>

          <div className="doc-warning">
            <strong>Importante:</strong> essa indicação visual é um
            recurso de apoio. A interpretação de CP e CPK deve considerar
            também a distribuição dos dados, os limites de especificação
            e o contexto do processo.
          </div>
        </section>


        {/* =====================================================
            7. GRÁFICO DE CONTROLE
        ===================================================== */}

        <section className="doc-section">
          <h2>7. Gráfico de Controle</h2>

          <p>
            O Gráfico de Controle apresenta a evolução dos dados ao longo
            das medições e permite acompanhar visualmente a variação
            existente no processo.
          </p>

          <p>
            O sistema utiliza os dados organizados em subgrupos para
            construir a representação do comportamento das medições.
          </p>

          <h3>Principais elementos</h3>

          <table>
            <thead>
              <tr>
                <th>Elemento</th>
                <th>Descrição</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Valores das medições</td>
                <td>
                  Representam os dados utilizados no acompanhamento.
                </td>
              </tr>

              <tr>
                <td>Linha central</td>
                <td>
                  Referência central utilizada na representação do gráfico.
                </td>
              </tr>

              <tr>
                <td>Limite de Controle Superior</td>
                <td>
                  Limite superior utilizado para acompanhamento da variação.
                </td>
              </tr>

              <tr>
                <td>Limite de Controle Inferior</td>
                <td>
                  Limite inferior utilizado para acompanhamento da variação.
                </td>
              </tr>

              <tr>
                <td>Subgrupos</td>
                <td>
                  Agrupamentos de observações utilizados no cálculo e
                  representação do gráfico.
                </td>
              </tr>
            </tbody>
          </table>

          <div className="doc-alert">
            O Gráfico de Controle deve ser analisado considerando a
            sequência das observações e os limites apresentados no
            gráfico, e não apenas um ponto isolado.
          </div>
        </section>


        {/* =====================================================
            8. TENDÊNCIA
        ===================================================== */}

        <section className="doc-section">
          <h2>8. Análise de tendência</h2>

          <p>
            A análise de tendência permite visualizar a evolução dos
            resultados ao longo do período disponível no estudo.
          </p>

          <p>
            Essa visualização é especialmente útil quando o objetivo é
            observar como determinada característica se comporta ao longo
            de diferentes medições.
          </p>

          <h3>O que observar?</h3>

          <ul>
            <li>
              Evolução dos valores ao longo do tempo.
            </li>

            <li>
              Alterações no comportamento das medições.
            </li>

            <li>
              Aproximação ou afastamento dos limites especificados.
            </li>

            <li>
              Mudanças persistentes no comportamento dos dados.
            </li>
          </ul>
        </section>


        {/* =====================================================
            9. RISK ASSESSMENT
        ===================================================== */}

        <section className="doc-section">
          <h2>9. Risk Assessment</h2>

          <p>
            O Risk Assessment é utilizado para organizar informações
            relacionadas à avaliação de riscos dentro do estudo.
          </p>

          <p>
            Essa etapa complementa a análise estatística ao permitir que
            os resultados observados sejam relacionados às informações
            utilizadas na avaliação dos riscos do processo.
          </p>

          <div className="doc-warning">
            <strong>Importante:</strong> os critérios utilizados no
            preenchimento e interpretação do Risk Assessment devem seguir
            o procedimento definido para o estudo e para a organização.
          </div>
        </section>


        {/* =====================================================
            10. RELAÇÃO ENTRE AS ANÁLISES
        ===================================================== */}

        <section className="doc-section">
          <h2>10. Como os recursos de análise se complementam?</h2>

          <p>
            Os diferentes recursos não devem ser vistos como análises
            isoladas. Cada um apresenta uma perspectiva diferente dos
            mesmos dados.
          </p>

          <table>
            <thead>
              <tr>
                <th>Recurso</th>
                <th>Principal perspectiva</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Análise estatística</td>
                <td>
                  Características estatísticas dos dados.
                </td>
              </tr>

              <tr>
                <td>Capability</td>
                <td>
                  Distribuição dos dados em relação às especificações.
                </td>
              </tr>

              <tr>
                <td>CP / CPK</td>
                <td>
                  Indicadores relacionados à capacidade do processo.
                </td>
              </tr>

              <tr>
                <td>Gráfico de Controle</td>
                <td>
                  Comportamento e variação ao longo das observações.
                </td>
              </tr>

              <tr>
                <td>Tendência</td>
                <td>
                  Evolução dos resultados ao longo do período.
                </td>
              </tr>

              <tr>
                <td>Risk Assessment</td>
                <td>
                  Organização das informações relacionadas aos riscos.
                </td>
              </tr>
            </tbody>
          </table>

          <p>
            A utilização conjunta dessas informações proporciona uma
            avaliação mais completa do estudo.
          </p>
        </section>


        {/* =====================================================
            11. SALVAMENTO DOS RESULTADOS
        ===================================================== */}

        <section className="doc-section">
          <h2>11. Salvamento dos resultados</h2>

          <p>
            Os resultados gerados pelas páginas de análise podem ser
            armazenados no contexto do estudo para utilização posterior
            no Report Builder.
          </p>

          <p>
            Dessa forma, o usuário não precisa reconstruir manualmente
            todos os resultados quando chegar à etapa de montagem do
            relatório.
          </p>

          <div className="analysis-report-flow">

            <div>
              <BarChart3 size={20} />
              <span>Análise</span>
            </div>

            <div className="analysis-report-arrow">
              →
            </div>

            <div>
              <FileText size={20} />
              <span>Resultado salvo</span>
            </div>

            <div className="analysis-report-arrow">
              →
            </div>

            <div>
              <FileText size={20} />
              <span>Report Builder</span>
            </div>

          </div>

          <div className="doc-alert">
            <strong>Boa prática:</strong> após gerar um resultado que fará
            parte do estudo, confirme se ele foi salvo corretamente antes
            de avançar para outra etapa.
          </div>
        </section>


        {/* =====================================================
            12. FLUXO DE ANÁLISE
        ===================================================== */}

        <section className="doc-section">
          <h2>12. Fluxo recomendado de análise</h2>

          <p>
            Depois de preparar os dados na Página Inicial, recomenda-se
            seguir uma sequência lógica durante a análise:
          </p>

          <div className="analysis-flow">

            <div className="analysis-flow-item">
              <strong>01</strong>
              <span>Confirmar os dados</span>
            </div>

            <div className="analysis-flow-item">
              <strong>02</strong>
              <span>Executar a análise estatística</span>
            </div>

            <div className="analysis-flow-item">
              <strong>03</strong>
              <span>Avaliar Capability e CP/CPK</span>
            </div>

            <div className="analysis-flow-item">
              <strong>04</strong>
              <span>Verificar o Gráfico de Controle</span>
            </div>

            <div className="analysis-flow-item">
              <strong>05</strong>
              <span>Avaliar a tendência</span>
            </div>

            <div className="analysis-flow-item">
              <strong>06</strong>
              <span>Realizar o Risk Assessment</span>
            </div>

            <div className="analysis-flow-item">
              <strong>07</strong>
              <span>Salvar os resultados necessários</span>
            </div>

            <div className="analysis-flow-item">
              <strong>08</strong>
              <span>Prosseguir para o Report Builder</span>
            </div>

          </div>
        </section>


        {/* =====================================================
            13. CUIDADOS
        ===================================================== */}

        <section className="doc-section">
          <h2>13. Cuidados durante a análise</h2>

          <ul>
            <li>
              Verifique se os dados utilizados pertencem à peça correta.
            </li>

            <li>
              Confirme os limites de especificação antes de interpretar
              CP e CPK.
            </li>

            <li>
              Não avalie o processo utilizando apenas um indicador.
            </li>

            <li>
              Observe os gráficos em conjunto com os indicadores
              estatísticos.
            </li>

            <li>
              Considere a quantidade e a qualidade dos dados utilizados.
            </li>

            <li>
              Salve os resultados necessários para composição do relatório.
            </li>

            <li>
              Consulte a área de <strong>Conceitos</strong> quando houver
              dúvida sobre o significado estatístico de um indicador.
            </li>
          </ul>

          <div className="doc-warning">
            <strong>Regra prática:</strong> o sistema fornece os cálculos
            e as representações estatísticas; a interpretação dos
            resultados deve considerar o contexto do estudo, os limites
            definidos e os critérios utilizados pela organização.
          </div>
        </section>


        {/* =====================================================
            RODAPÉ
        ===================================================== */}

        <footer className="doc-footer">
          <p>
            Sistema SIX SIGMA — Documentação Interna
          </p>
        </footer>

      </div>
    </DocumentationLayout>
  );
} 
 
 