"use client";

import DocumentationLayout from "../components/DocumentationLayout";
import "../documentation.css";
import "./action-plan.css";

export default function ActionPlanPage() {
  return (
    <DocumentationLayout>
      <div className="documentation-page action-plan-page">

        {/* CABEÇALHO */}
        <header className="documentation-page-header">
          <span className="documentation-page-kicker">
            PLANO DE AÇÃO
          </span>

          <h1>Plano de Ação</h1>

          <p>
            O Plano de Ação é utilizado para registrar as ações necessárias
            para tratar problemas identificados durante a análise dos dados,
            acompanhar responsabilidades e definir como os resultados serão
            tratados.
          </p>
        </header>

        {/* 1 */}
        <section className="documentation-section">
          <h2>1. Objetivo do Plano de Ação</h2>

          <p>
            Depois que os dados são analisados, podem ser identificadas
            características que precisam de atenção, como variações,
            resultados fora dos limites especificados ou condições que
            necessitam de uma ação corretiva.
          </p>

          <p>
            O Plano de Ação transforma essas informações em ações práticas,
            permitindo registrar o que precisa ser feito, quem será
            responsável e quais informações devem ser acompanhadas.
          </p>

          <div className="action-plan-highlight">
            <strong>Objetivo principal</strong>
            <span>
              Transformar os resultados encontrados na análise estatística
              em ações organizadas e rastreáveis.
            </span>
          </div>
        </section>

        {/* 2 */}
        <section className="documentation-section">
          <h2>2. Quando utilizar</h2>

          <p>
            O Plano de Ação deve ser utilizado quando a análise indicar que
            existe uma situação que precisa ser investigada, corrigida,
            monitorada ou melhorada.
          </p>

          <div className="action-plan-card-grid">
            <div className="action-plan-card">
              <div className="action-plan-card-icon">📊</div>
              <h3>Resultado estatístico</h3>
              <p>
                Uma análise apresenta um resultado que precisa ser avaliado
                ou acompanhado.
              </p>
            </div>

            <div className="action-plan-card">
              <div className="action-plan-card-icon">⚠️</div>
              <h3>Desvio identificado</h3>
              <p>
                É identificada uma condição que pode exigir uma ação para
                evitar sua repetição.
              </p>
            </div>

            <div className="action-plan-card">
              <div className="action-plan-card-icon">🔎</div>
              <h3>Necessidade de investigação</h3>
              <p>
                Os dados indicam uma situação que precisa ser investigada
                para determinar sua causa.
              </p>
            </div>

            <div className="action-plan-card">
              <div className="action-plan-card-icon">📈</div>
              <h3>Oportunidade de melhoria</h3>
              <p>
                Os resultados podem indicar uma oportunidade para melhorar
                o processo ou reduzir sua variabilidade.
              </p>
            </div>
          </div>
        </section>

        {/* 3 */}
        <section className="documentation-section">
          <h2>3. Estrutura do Plano de Ação</h2>

          <p>
            Um plano de ação eficiente deve deixar claro qual problema foi
            identificado, o que será feito e como a ação será acompanhada.
          </p>

          <div className="action-plan-fields">
            <div className="action-plan-field">
              <span className="action-plan-field-number">01</span>

              <div>
                <h3>Problema / situação identificada</h3>
                <p>
                  Descreva de forma objetiva o problema ou a condição que
                  originou a necessidade da ação.
                </p>
              </div>
            </div>

            <div className="action-plan-field">
              <span className="action-plan-field-number">02</span>

              <div>
                <h3>Ação</h3>
                <p>
                  Registre o que deverá ser feito para tratar a situação
                  identificada.
                </p>
              </div>
            </div>

            <div className="action-plan-field">
              <span className="action-plan-field-number">03</span>

              <div>
                <h3>Responsável</h3>
                <p>
                  Indique quem será responsável por executar ou acompanhar
                  a ação definida.
                </p>
              </div>
            </div>

            <div className="action-plan-field">
              <span className="action-plan-field-number">04</span>

              <div>
                <h3>Prazo</h3>
                <p>
                  Defina quando a ação deverá ser realizada ou concluída.
                </p>
              </div>
            </div>

            <div className="action-plan-field">
              <span className="action-plan-field-number">05</span>

              <div>
                <h3>Acompanhamento</h3>
                <p>
                  Registre informações relevantes para acompanhar a execução
                  e o resultado da ação.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4 */}
        <section className="documentation-section">
          <h2>4. Como preencher corretamente</h2>

          <p>
            O plano deve ser preenchido utilizando informações objetivas e
            relacionadas aos resultados encontrados durante a análise.
          </p>

          <div className="action-plan-guidelines">
            <div className="action-plan-guideline positive">
              <span>✓</span>

              <div>
                <strong>Seja específico</strong>
                <p>
                  Descreva exatamente o que precisa ser tratado e qual ação
                  será realizada.
                </p>
              </div>
            </div>

            <div className="action-plan-guideline positive">
              <span>✓</span>

              <div>
                <strong>Utilize os dados da análise</strong>
                <p>
                  Sempre que possível, relacione a ação aos resultados
                  apresentados pelo sistema.
                </p>
              </div>
            </div>

            <div className="action-plan-guideline positive">
              <span>✓</span>

              <div>
                <strong>Defina um responsável</strong>
                <p>
                  Uma ação deve possuir uma pessoa ou área responsável pelo
                  seu acompanhamento.
                </p>
              </div>
            </div>

            <div className="action-plan-guideline positive">
              <span>✓</span>

              <div>
                <strong>Defina um prazo</strong>
                <p>
                  O prazo facilita o acompanhamento da evolução da ação.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5 */}
        <section className="documentation-section">
          <h2>5. Relação com a análise estatística</h2>

          <p>
            O Plano de Ação não deve ser tratado como uma etapa isolada.
            Ele faz parte do fluxo de utilização dos resultados obtidos
            durante a análise.
          </p>

          <div className="action-plan-flow">
            <div className="action-plan-flow-item">
              <span>01</span>
              <strong>Dados</strong>
              <small>
                Arquivos e medições importados para o sistema
              </small>
            </div>

            <div className="action-plan-flow-arrow">→</div>

            <div className="action-plan-flow-item">
              <span>02</span>
              <strong>Análise</strong>
              <small>
                Avaliação estatística dos resultados
              </small>
            </div>

            <div className="action-plan-flow-arrow">→</div>

            <div className="action-plan-flow-item">
              <span>03</span>
              <strong>Identificação</strong>
              <small>
                Situações que precisam de atenção
              </small>
            </div>

            <div className="action-plan-flow-arrow">→</div>

            <div className="action-plan-flow-item">
              <span>04</span>
              <strong>Plano de Ação</strong>
              <small>
                Definição e acompanhamento das ações
              </small>
            </div>
          </div>
        </section>

        {/* 6 */}
        <section className="documentation-section">
          <h2>6. Exemplo de utilização</h2>

          <p>
            Imagine que uma análise apresente um comportamento que exige
            investigação. O resultado da análise pode ser utilizado como
            ponto de partida para registrar uma ação.
          </p>

          <div className="action-plan-example">
            <div className="action-plan-example-header">
              <span>EXEMPLO</span>
              <strong>Tratamento de uma situação identificada</strong>
            </div>

            <div className="action-plan-example-body">

              <div>
                <span>Problema identificado</span>
                <p>
                  Foi observada uma variação no resultado de uma
                  característica durante a análise.
                </p>
              </div>

              <div>
                <span>Ação</span>
                <p>
                  Investigar as possíveis causas da variação e verificar
                  as condições do processo.
                </p>
              </div>

              <div>
                <span>Responsável</span>
                <p>
                  Definir o responsável pelo acompanhamento da investigação.
                </p>
              </div>

              <div>
                <span>Resultado esperado</span>
                <p>
                  Identificar a causa e definir uma ação adequada para o
                  processo.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* 7 */}
        <section className="documentation-section">
          <h2>7. Boas práticas</h2>

          <ul className="documentation-list">
            <li>
              Baseie as ações nos resultados observados durante a análise.
            </li>

            <li>
              Evite descrições genéricas que não permitam identificar o que
              precisa ser feito.
            </li>

            <li>
              Registre responsáveis e prazos de forma clara.
            </li>

            <li>
              Utilize informações objetivas para facilitar o acompanhamento.
            </li>

            <li>
              Revise o plano sempre que novas informações alterarem a
              compreensão do problema.
            </li>
          </ul>
        </section>

        {/* 8 */}
        <section className="documentation-section">
          <h2>8. Plano de Ação dentro do SIX SIGMA</h2>

          <p>
            Dentro do sistema, o Plano de Ação complementa as análises
            realizadas anteriormente. O objetivo é evitar que os resultados
            estatísticos fiquem apenas como informação e permitir que eles
            sejam utilizados como base para decisões e ações no processo.
          </p>

          <div className="action-plan-final-note">
            <strong>Em resumo</strong>

            <p>
              A análise mostra <strong>o que está acontecendo</strong>.
              O Plano de Ação organiza <strong>o que deve ser feito</strong>
              a partir dessas informações.
            </p>
          </div>
        </section>

      </div>
    </DocumentationLayout>
  );
}  
 
 