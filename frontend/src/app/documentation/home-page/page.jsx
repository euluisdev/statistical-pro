"use client";

import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  FileText,
  FolderPlus,
  Image,
  Info,
  PlayCircle,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";

import DocumentationLayout from "../components/DocumentationLayout";
import "../documentation.css";
import "./home-page.css";

export default function DocumentationHomePage() {
  return (
    <DocumentationLayout>
      <div className="doc-page">

        {/* =====================================================
            CABEÇALHO
        ===================================================== */}

        <header className="doc-header">
          <h1>Página Inicial</h1>

          <p>
            Guia completo para utilização da página inicial do SIX SIGMA,
            desde a criação do conjunto e cadastro da peça até a importação
            dos arquivos de medição, extração dos dados e visualização da
            Pivot Table.
          </p>
        </header>


        {/* =====================================================
            1. OBJETIVO
        ===================================================== */}

        <section className="doc-section">
          <h2>1. Objetivo desta página</h2>

          <p>
            A Página Inicial é o ponto de partida operacional para um novo
            estudo dentro do SIX SIGMA.
          </p>

          <p>
            É nesta área que o usuário organiza o estudo, criando ou
            selecionando um conjunto, cadastrando a peça que será analisada,
            importando os arquivos TXT provenientes da medição e preparando
            os dados que serão utilizados nas etapas seguintes.
          </p>

          <p>
            Ao final desse processo, os dados estarão disponíveis em uma
            estrutura organizada para que o usuário possa avançar para as
            análises estatísticas.
          </p>

          <div className="doc-alert">
            <strong>Em resumo:</strong> a Página Inicial prepara os dados
            para todo o restante do estudo.
          </div>
        </section>


        {/* =====================================================
            2. VISÃO DA TELA
        ===================================================== */}

        <section className="doc-section">
          <h2>2. Visão da Página Inicial</h2>

          <p>
            A página é dividida em áreas que representam diferentes etapas
            do processo.
          </p>

          <div className="home-page-area-list">

            <div className="home-page-area">
              <FolderPlus size={20} />

              <div>
                <strong>Conjuntos</strong>
                <span>
                  Criação, seleção, exclusão e controle do estudo.
                </span>
              </div>
            </div>

            <div className="home-page-area">
              <PlayCircle size={20} />

              <div>
                <strong>Job</strong>
                <span>
                  Identificação do estudo utilizado para organização dos
                  resultados e relatório.
                </span>
              </div>
            </div>

            <div className="home-page-area">
              <Image size={20} />

              <div>
                <strong>Peças</strong>
                <span>
                  Cadastro, seleção, visualização e exclusão das peças.
                </span>
              </div>
            </div>

            <div className="home-page-area">
              <Upload size={20} />

              <div>
                <strong>Arquivos TXT</strong>
                <span>
                  Importação, consulta, exclusão e extração dos dados.
                </span>
              </div>
            </div>

            <div className="home-page-area">
              <BarChart3 size={20} />

              <div>
                <strong>Pivot Table</strong>
                <span>
                  Visualização estruturada dos dados extraídos.
                </span>
              </div>
            </div>

          </div>
        </section>


        {/* =====================================================
            3. CRIANDO CONJUNTO
        ===================================================== */}

        <section className="doc-section">
          <h2>3. Criando um Conjunto</h2>

          <p>
            O conjunto é o primeiro nível de organização do estudo.
            Ele funciona como um agrupador para as peças e arquivos
            relacionados à análise.
          </p>

          <h3>Como criar</h3>

          <ol>
            <li>
              Localize a área <strong>Novo Conjunto</strong>.
            </li>

            <li>
              Digite o nome desejado no campo
              <strong> Nome do conjunto</strong>.
            </li>

            <li>
              Clique no botão com o ícone de criação.
            </li>

            <li>
              O sistema apresentará uma confirmação antes da criação.
            </li>

            <li>
              Confirme a criação do conjunto.
            </li>
          </ol>

          <div className="home-step-card">
            <div className="home-step-icon">
              <FolderPlus size={22} />
            </div>

            <div>
              <strong>Exemplo</strong>

              <p>
                Um conjunto pode representar um estudo ou agrupamento
                específico de peças que serão analisadas dentro do sistema.
              </p>
            </div>
          </div>

          <div className="doc-warning">
            <strong>Atenção:</strong> escolha nomes que permitam identificar
            facilmente o estudo posteriormente.
          </div>
        </section>


        {/* =====================================================
            4. SELECIONANDO CONJUNTO
        ===================================================== */}

        <section className="doc-section">
          <h2>4. Selecionando um Conjunto</h2>

          <p>
            Depois de criar ou carregar os conjuntos disponíveis, selecione
            aquele que será utilizado no estudo atual.
          </p>

          <ol>
            <li>
              Localize o campo <strong>Conjunto</strong>.
            </li>

            <li>
              Abra a lista de conjuntos disponíveis.
            </li>

            <li>
              Selecione o conjunto desejado.
            </li>
          </ol>

          <p>
            Depois da seleção, o sistema passa a utilizar esse conjunto
            como contexto das operações seguintes, como cadastro da peça
            e importação dos arquivos TXT.
          </p>
        </section>


        {/* =====================================================
            5. JOB
        ===================================================== */}

        <section className="doc-section">
          <h2>5. Criando um Job</h2>

          <p>
            O Job representa um identificador único associado ao estudo
            que está sendo realizado.
          </p>

          <p>
            Ele é utilizado pelo sistema para organizar os resultados
            gerados durante o processo, especialmente os arquivos que
            posteriormente poderão ser utilizados na construção do
            relatório.
          </p>

          <h3>Como criar um Job</h3>

          <ol>
            <li>
              Selecione primeiro o conjunto desejado.
            </li>

            <li>
              Localize o botão de criação do Job.
            </li>

            <li>
              Clique no botão com o ícone de execução.
            </li>

            <li>
              O sistema solicitará uma confirmação.
            </li>

            <li>
              Confirme a criação.
            </li>
          </ol>

          <div className="doc-alert">
            <strong>Importante:</strong> o Job deve ser entendido como o
            identificador do estudo em execução. Ele é especialmente
            importante quando os resultados gerados nas páginas de análise
            serão posteriormente reunidos no relatório.
          </div>
        </section>


        {/* =====================================================
            6. ENCERRANDO JOB
        ===================================================== */}

        <section className="doc-section">
          <h2>6. Encerrando um Job</h2>

          <p>
            Quando o estudo associado ao Job for finalizado, o usuário
            pode encerrar o Job atual.
          </p>

          <ol>
            <li>
              Localize o botão de encerramento.
            </li>

            <li>
              Clique no botão correspondente.
            </li>

            <li>
              Confirme a operação.
            </li>
          </ol>

          <div className="doc-warning">
            <strong>Atenção:</strong> o encerramento do Job remove o
            identificador ativo armazenado pelo sistema. Antes de encerrar,
            certifique-se de que o estudo atual não precisa mais desse Job.
          </div>
        </section>


        {/* =====================================================
            7. EXCLUIR CONJUNTO
        ===================================================== */}

        <section className="doc-section">
          <h2>7. Excluindo um Conjunto</h2>

          <p>
            Um conjunto selecionado pode ser excluído utilizando o botão
            de exclusão.
          </p>

          <ol>
            <li>
              Selecione o conjunto que deseja excluir.
            </li>

            <li>
              Clique no botão de exclusão.
            </li>

            <li>
              Leia a mensagem apresentada pelo sistema.
            </li>

            <li>
              Confirme a exclusão caso tenha certeza da operação.
            </li>
          </ol>

          <div className="doc-warning">
            <strong>Atenção:</strong> a exclusão do conjunto remove o
            conjunto e os dados associados a ele. Utilize essa função
            somente quando tiver certeza de que o estudo não será mais
            necessário.
          </div>
        </section>


        {/* =====================================================
            8. CADASTRAR PEÇA
        ===================================================== */}

        <section className="doc-section">
          <h2>8. Cadastrando uma Peça</h2>

          <p>
            Depois de selecionar o conjunto, é possível cadastrar a peça
            que será analisada.
          </p>

          <p>
            O cadastro possui informações que identificam a peça dentro
            do estudo.
          </p>

          <h3>Informações disponíveis</h3>

          <table>
            <thead>
              <tr>
                <th>Campo</th>
                <th>Finalidade</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Part Number</td>
                <td>
                  Identificação da peça.
                </td>
              </tr>

              <tr>
                <td>Nome</td>
                <td>
                  Nome ou descrição da peça.
                </td>
              </tr>

              <tr>
                <td>Modelo</td>
                <td>
                  Modelo ao qual a peça está relacionada.
                </td>
              </tr>

              <tr>
                <td>Imagem</td>
                <td>
                  Imagem utilizada para identificação visual da peça.
                </td>
              </tr>
            </tbody>
          </table>

          <h3>Como cadastrar</h3>

          <ol>
            <li>
              Verifique se o conjunto correto está selecionado.
            </li>

            <li>
              Preencha o <strong>Part Number</strong>.
            </li>

            <li>
              Preencha o campo <strong>Nome</strong>.
            </li>

            <li>
              Preencha o campo <strong>Modelo</strong>.
            </li>

            <li>
              Se desejar, selecione uma imagem para a peça.
            </li>

            <li>
              Clique no botão de criação.
            </li>

            <li>
              Confirme o cadastro quando solicitado.
            </li>
          </ol>
        </section>


        {/* =====================================================
            9. SELECIONAR PEÇA
        ===================================================== */}

        <section className="doc-section">
          <h2>9. Selecionando uma Peça</h2>

          <p>
            As peças cadastradas no conjunto podem ser selecionadas
            através da lista disponível na área <strong>Peças</strong>.
          </p>

          <ol>
            <li>
              Abra a lista de peças.
            </li>

            <li>
              Localize o Part Number desejado.
            </li>

            <li>
              Selecione a peça.
            </li>
          </ol>

          <p>
            A peça selecionada passa a ser o contexto das operações de
            importação, extração dos dados e acesso à análise.
          </p>
        </section>


        {/* =====================================================
            10. IMAGEM
        ===================================================== */}

        <section className="doc-section">
          <h2>10. Visualização da imagem da peça</h2>

          <p>
            Quando uma peça possui uma imagem cadastrada, o sistema
            disponibiliza sua visualização na área correspondente.
          </p>

          <p>
            Essa imagem funciona como uma referência visual para auxiliar
            na identificação da peça selecionada.
          </p>

          <div className="doc-alert">
            <strong>Boa prática:</strong> utilize uma imagem que permita
            identificar visualmente a peça de maneira clara.
          </div>
        </section>


        {/* =====================================================
            11. IMPORTAR TXT
        ===================================================== */}

        <section className="doc-section">
          <h2>11. Importando arquivos TXT</h2>

          <p>
            Os arquivos TXT são a principal entrada de dados de medição
            utilizada pelo fluxo da Página Inicial.
          </p>

          <p>
            É possível selecionar múltiplos arquivos de uma única vez.
          </p>

          <h3>Como importar</h3>

          <ol>
            <li>
              Certifique-se de que um conjunto está selecionado.
            </li>

            <li>
              Certifique-se de que uma peça está selecionada.
            </li>

            <li>
              Localize a área <strong>Importar</strong>.
            </li>

            <li>
              Clique no campo destinado aos arquivos TXT.
            </li>

            <li>
              Selecione um ou vários arquivos com extensão
              <strong> .TXT</strong>.
            </li>

            <li>
              Confirme a seleção.
            </li>

            <li>
              Clique no botão de envio.
            </li>
          </ol>

          <div className="home-step-card">
            <div className="home-step-icon">
              <Upload size={22} />
            </div>

            <div>
              <strong>Importação múltipla</strong>

              <p>
                O sistema permite selecionar vários arquivos TXT na mesma
                operação, facilitando a preparação dos dados de um estudo
                que possui diversas medições.
              </p>
            </div>
          </div>

          <div className="doc-warning">
            <strong>Importante:</strong> selecione corretamente o conjunto
            e a peça antes de realizar a importação. Os arquivos são
            associados ao contexto selecionado.
          </div>
        </section>


        {/* =====================================================
            12. CONSULTAR TXT
        ===================================================== */}

        <section className="doc-section">
          <h2>12. Consultando os arquivos importados</h2>

          <p>
            Depois da importação, os arquivos disponíveis para a peça
            aparecem na área de arquivos TXT.
          </p>

          <p>
            A quantidade de arquivos também é apresentada no título da
            seção, permitindo verificar rapidamente quantos arquivos estão
            associados à peça.
          </p>

          <p>
            Cada arquivo possui uma caixa de seleção que pode ser utilizada
            para realizar operações sobre um ou mais arquivos.
          </p>
        </section>


        {/* =====================================================
            13. EXCLUIR TXT
        ===================================================== */}

        <section className="doc-section">
          <h2>13. Excluindo arquivos TXT</h2>

          <p>
            Arquivos que não devem mais fazer parte do estudo podem ser
            selecionados e excluídos.
          </p>

          <h3>Como excluir</h3>

          <ol>
            <li>
              Localize o arquivo desejado na lista.
            </li>

            <li>
              Marque a caixa de seleção do arquivo.
            </li>

            <li>
              Se necessário, selecione outros arquivos.
            </li>

            <li>
              Clique no botão de exclusão.
            </li>

            <li>
              Confirme a operação.
            </li>
          </ol>

          <div className="doc-warning">
            <strong>Atenção:</strong> verifique os arquivos selecionados
            antes de confirmar a exclusão.
          </div>
        </section>


        {/* =====================================================
            14. EXTRAIR DADOS
        ===================================================== */}

        <section className="doc-section">
          <h2>14. Extraindo os dados dos TXT</h2>

          <p>
            A importação dos arquivos e a extração dos dados são etapas
            diferentes.
          </p>

          <p>
            Primeiro, os arquivos TXT são armazenados no contexto da peça.
            Depois, o usuário utiliza a função de extração para que o
            conteúdo dos arquivos seja processado e disponibilizado para
            visualização.
          </p>

          <h3>Como realizar a extração</h3>

          <ol>
            <li>
              Confirme que os arquivos necessários foram importados.
            </li>

            <li>
              Localize o botão de atualização/extração.
            </li>

            <li>
              Clique no botão.
            </li>

            <li>
              Aguarde o processamento.
            </li>

            <li>
              Após o processamento, os dados extraídos serão disponibilizados
              para a Pivot Table.
            </li>
          </ol>

          <div className="home-step-card">
            <div className="home-step-icon">
              <RefreshCw size={22} />
            </div>

            <div>
              <strong>O que acontece nesta etapa?</strong>

              <p>
                O sistema processa os arquivos de medição e organiza os
                dados extraídos para que possam ser apresentados de forma
                estruturada.
              </p>
            </div>
          </div>
        </section>


        {/* =====================================================
            15. PIVOT TABLE
        ===================================================== */}

        <section className="doc-section">
          <h2>15. Entendendo a Pivot Table</h2>

          <p>
            Depois que os dados são extraídos, o sistema apresenta uma
            Pivot Table com as informações organizadas por ponto e pelas
            diferentes datas de medição.
          </p>

          <p>
            Essa tabela funciona como uma visão consolidada dos dados
            importados e permite comparar os desvios registrados em
            diferentes relatórios.
          </p>

          <h3>Informações apresentadas</h3>

          <table>
            <thead>
              <tr>
                <th>Coluna</th>
                <th>Descrição</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Ponto</td>
                <td>
                  Identificação do ponto de medição.
                </td>
              </tr>

              <tr>
                <td>Eixo</td>
                <td>
                  Eixo associado ao ponto.
                </td>
              </tr>

              <tr>
                <td>Loc</td>
                <td>
                  Localização associada ao ponto.
                </td>
              </tr>

              <tr>
                <td>Tipo</td>
                <td>
                  Tipo geométrico do ponto.
                </td>
              </tr>

              <tr>
                <td>Nominal</td>
                <td>
                  Valor nominal definido para o ponto.
                </td>
              </tr>

              <tr>
                <td>Tol+</td>
                <td>
                  Tolerância superior.
                </td>
              </tr>

              <tr>
                <td>Tol−</td>
                <td>
                  Tolerância inferior.
                </td>
              </tr>

              <tr>
                <td>Datas</td>
                <td>
                  Registros de medição associados aos relatórios.
                </td>
              </tr>
            </tbody>
          </table>
        </section>


        {/* =====================================================
            16. CORES
        ===================================================== */}

        <section className="doc-section">
          <h2>16. Interpretando as cores da Pivot Table</h2>

          <p>
            A Pivot Table utiliza uma indicação visual para facilitar a
            identificação do comportamento dos desvios em relação às
            tolerâncias.
          </p>

          <div className="pivot-legend-guide">

            <div className="pivot-status status-ok">
              <CheckCircle2 size={20} />

              <div>
                <strong>OK</strong>
                <span>
                  O desvio permanece dentro da região considerada normal
                  em relação às tolerâncias.
                </span>
              </div>
            </div>

            <div className="pivot-status status-warn">
              <Info size={20} />

              <div>
                <strong>Limite</strong>
                <span>
                  O valor está se aproximando da região limite definida
                  pelo sistema.
                </span>
              </div>
            </div>

            <div className="pivot-status status-fail">
              <AlertTriangle size={20} />

              <div>
                <strong>Fora</strong>
                <span>
                  O desvio ultrapassou uma das tolerâncias definidas para
                  o ponto.
                </span>
              </div>
            </div>

          </div>

          <div className="doc-warning">
            <strong>Importante:</strong> a indicação visual da Pivot Table
            facilita a identificação dos pontos que merecem atenção, mas
            a interpretação estatística completa deve ser realizada nas
            páginas de análise.
          </div>
        </section>


        {/*17 - ACESSAR ANÁLISE*/}

        <section className="doc-section">
          <h2>17. Acessando a Análise</h2>

          <p>
            Depois que a peça estiver selecionada, o usuário pode acessar
            a área de análise estatística através do botão correspondente
            na área de peças.
          </p>

          <ol>
            <li>
              Selecione o conjunto.
            </li>

            <li>
              Selecione a peça.
            </li>

            <li>
              Localize o botão de acesso à análise.
            </li>

            <li>
              Clique no botão.
            </li>
          </ol>

          <div className="home-navigation-card">
            <BarChart3 size={24} />

            <div>
              <strong>Próxima etapa</strong>

              <p>
                A partir daqui, o estudo deixa a etapa de preparação dos
                dados e passa para a área de análise estatística.
              </p>
            </div>
          </div>
        </section>


        {/*18. FLUXO COMPLETO */}

        <section className="doc-section">
          <h2>18. Fluxo completo recomendado</h2>

          <p>
            Para realizar um estudo desde o início, recomenda-se seguir
            esta sequência:
          </p>

          <div className="home-complete-flow">

            <div className="home-flow-item">
              <strong>01</strong>
              <span>Criar ou selecionar o conjunto</span>
            </div>

            <div className="home-flow-item">
              <strong>02</strong>
              <span>Criar o Job do estudo</span>
            </div>

            <div className="home-flow-item">
              <strong>03</strong>
              <span>Cadastrar ou selecionar a peça</span>
            </div>

            <div className="home-flow-item">
              <strong>04</strong>
              <span>Importar os arquivos TXT</span>
            </div>

            <div className="home-flow-item">
              <strong>05</strong>
              <span>Conferir os arquivos importados</span>
            </div>

            <div className="home-flow-item">
              <strong>06</strong>
              <span>Extrair os dados</span>
            </div>

            <div className="home-flow-item">
              <strong>07</strong>
              <span>Conferir a Pivot Table</span>
            </div>

            <div className="home-flow-item">
              <strong>08</strong>
              <span>Acessar a Análise</span>
            </div>

          </div>
        </section>


        {/*19 CUIDADOS*/}

        <section className="doc-section">
          <h2>19. Cuidados importantes</h2>

          <ul>
            <li>
              Confirme o conjunto selecionado antes de cadastrar uma peça
              ou importar arquivos.
            </li>

            <li>
              Confirme a peça selecionada antes de importar os TXT.
            </li>

            <li>
              Verifique se todos os arquivos necessários foram importados.
            </li>

            <li>
              Exclua arquivos incorretos antes de realizar a extração.
            </li>

            <li>
              Confira a Pivot Table depois da extração dos dados.
            </li>

            <li>
              Evite excluir conjuntos ou peças sem confirmar que os dados
              não serão mais necessários.
            </li>

            <li>
              Quando estiver realizando um estudo que será consolidado em
              relatório, mantenha o Job corretamente associado ao processo.
            </li>
          </ul>

          <div className="doc-alert">
            <strong>Regra prática:</strong> antes de avançar para a
            análise, confirme sempre três coisas:
            <strong> conjunto correto + peça correta + dados corretos.</strong>
          </div>
        </section>


        {/*RODAPÉ*/}

        <footer className="doc-footer">
          <p>
            Sistema SIX SIGMA — Documentação Interna
          </p>
        </footer>

      </div>
    </DocumentationLayout>
  );
}
 
 