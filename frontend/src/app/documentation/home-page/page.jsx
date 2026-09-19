"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  FolderKanban,
  Package,
  FileUp,
  Table2,
  Navigation,
} from "lucide-react";

import DocumentationLayout from "../components/DocumentationLayout";

export default function DocumentationHomePage() {
  return (
    <DocumentationLayout>
      <div className="doc-page">

        {/* CABEÇALHO */}

        <header className="doc-header">
          <h1>Página Inicial</h1>

          <p>
            Guia de utilização da tela principal do sistema SIX SIGMA.
          </p>
        </header>


        {/* OBJETIVO */}

        <section className="doc-section">
          <h2>Objetivo da Página</h2>

          <p>
            A Página Inicial é o ponto de partida do sistema SIX SIGMA.
            Nela são realizados os procedimentos necessários para iniciar
            uma análise estatística.
          </p>

          <p>
            O fluxo começa pela seleção do conjunto e da peça que será
            analisada, seguido pela importação dos arquivos de medição.
          </p>

          <h3>Principais funcionalidades</h3>

          <ul>
            <li>Criar e gerenciar conjuntos.</li>
            <li>Criar e gerenciar peças.</li>
            <li>Importar arquivos TXT de medição.</li>
            <li>Visualizar os dados extraídos.</li>
            <li>Acessar as demais etapas da análise.</li>
          </ul>
        </section>


        {/* ESTRUTURA */}

        <section className="doc-section">
          <h2>Estrutura da Tela</h2>

          <p>
            A Página Inicial é organizada em módulos que conduzem o usuário
            pelo processo de preparação dos dados.
          </p>

          <div className="doc-quick-links">

            <div className="doc-quick-link">
              <div className="doc-quick-link-icon">
                <FolderKanban size={20} />
              </div>

              <div>
                <strong>Gerenciador de Conjuntos</strong>

                <span>
                  Permite criar, selecionar e excluir conjuntos utilizados
                  na organização das análises.
                </span>
              </div>
            </div>

            <div className="doc-quick-link">
              <div className="doc-quick-link-icon">
                <Package size={20} />
              </div>

              <div>
                <strong>Gerenciador de Peças</strong>

                <span>
                  Permite criar, selecionar e excluir as peças pertencentes
                  ao conjunto selecionado.
                </span>
              </div>
            </div>

            <div className="doc-quick-link">
              <div className="doc-quick-link-icon">
                <FileUp size={20} />
              </div>

              <div>
                <strong>Importação de Arquivos</strong>

                <span>
                  Permite carregar os arquivos TXT provenientes das medições.
                </span>
              </div>
            </div>

            <div className="doc-quick-link">
              <div className="doc-quick-link-icon">
                <Table2 size={20} />
              </div>

              <div>
                <strong>Dados Extraídos</strong>

                <span>
                  Exibe os dados obtidos a partir dos arquivos importados.
                </span>
              </div>
            </div>

          </div>
        </section>


        {/* CONJUNTOS */}

        <section className="doc-section">
          <h2>Gerenciador de Conjuntos</h2>

          <p>
            O conjunto representa uma estrutura lógica utilizada para
            organizar as peças e os dados relacionados a uma determinada
            análise.
          </p>

          <h3>Funcionalidades</h3>

          <ul>
            <li>Criar um novo conjunto.</li>
            <li>Selecionar um conjunto existente.</li>
            <li>Excluir um conjunto.</li>
          </ul>

          <h3>Como criar um conjunto</h3>

          <ol>
            <li>Digite o nome desejado.</li>
            <li>Clique em <strong>Adicionar</strong>.</li>
            <li>Selecione o conjunto criado.</li>
          </ol>

          <div className="doc-alert">
            Ao selecionar um conjunto, o sistema carrega automaticamente
            as peças relacionadas a ele.
          </div>
        </section>


        {/* PEÇAS */}

        <section className="doc-section">
          <h2>Gerenciador de Peças</h2>

          <p>
            A peça representa o item físico que será analisado dentro
            do conjunto selecionado.
          </p>

          <div className="doc-warning">
            É necessário selecionar um conjunto antes de criar ou
            selecionar uma peça.
          </div>

          <h3>Funcionalidades</h3>

          <ul>
            <li>Criar uma nova peça.</li>
            <li>Selecionar uma peça existente.</li>
            <li>Excluir uma peça.</li>
          </ul>

          <h3>Como criar uma peça</h3>

          <ol>
            <li>Selecione um conjunto.</li>
            <li>Digite o nome da peça.</li>
            <li>Clique em <strong>Adicionar</strong>.</li>
            <li>Selecione a peça criada.</li>
          </ol>
        </section>


        {/* TXT */}

        <section className="doc-section">
          <h2>Importação de Arquivos TXT</h2>

          <p>
            O módulo de importação permite carregar os arquivos de medição
            utilizados pelo sistema para realizar a análise estatística.
          </p>

          <h3>Pré-requisitos</h3>

          <ul>
            <li>Um conjunto deve estar selecionado.</li>
            <li>Uma peça deve estar selecionada.</li>
            <li>O arquivo deve estar no formato TXT esperado pelo sistema.</li>
          </ul>

          <h3>Fluxo de importação</h3>

          <ol>
            <li>Selecione o arquivo TXT.</li>
            <li>Aguarde o processamento do arquivo.</li>
            <li>Confira os dados apresentados na tabela.</li>
          </ol>

          <div className="doc-alert">
            Os dados extraídos são apresentados automaticamente após
            o processamento do arquivo.
          </div>
        </section>


        {/* TABELA */}

        <section className="doc-section">
          <h2>Tabela de Dados Extraídos</h2>

          <p>
            Após a importação, os dados encontrados nos arquivos são
            apresentados em uma tabela para conferência.
          </p>

          <h3>Objetivo da tabela</h3>

          <ul>
            <li>Verificar se o arquivo foi processado corretamente.</li>
            <li>Visualizar os valores extraídos.</li>
            <li>Conferir as informações antes de iniciar a análise.</li>
          </ul>

          <div className="doc-warning">
            Recomenda-se conferir os dados apresentados antes de avançar
            para a etapa de análise.
          </div>
        </section>


        {/* NAVEGAÇÃO */}

        <section className="doc-section">
          <h2>Navegação</h2>

          <p>
            Após concluir a preparação dos dados, utilize os controles
            de navegação disponíveis na tela para avançar para as próximas
            etapas do sistema.
          </p>

          <div className="doc-quick-links">

            <div className="doc-quick-link">
              <div className="doc-quick-link-icon">
                <Navigation size={20} />
              </div>

              <div>
                <strong>Navegação do sistema</strong>

                <span>
                  Os controles disponíveis permitem retornar, avançar
                  ou acessar outras áreas do sistema.
                </span>
              </div>
            </div>

          </div>
        </section>


        {/* FLUXO */}

        <section className="doc-section">
          <h2>Fluxo Completo</h2>

          <p>
            O procedimento básico para iniciar uma análise segue esta
            sequência:
          </p>

          <ol>
            <li>Criar ou selecionar um conjunto.</li>
            <li>Criar ou selecionar uma peça.</li>
            <li>Importar os arquivos TXT.</li>
            <li>Conferir os dados extraídos.</li>
            <li>Avançar para a etapa de análise.</li>
          </ol>
        </section>


        {/* NAVEGAÇÃO ENTRE DOCUMENTAÇÕES */}

        <div className="doc-page-navigation">

          <Link
            href="/documentation"
            className="doc-navigation-link"
          >
            <ArrowLeft size={17} />

            <div>
              <small>Anterior</small>
              <strong>Início da documentação</strong>
            </div>
          </Link>


          <Link
            href="/documentation/analysis"
            className="doc-navigation-link doc-navigation-next"
          >
            <div>
              <small>Próximo</small>
              <strong>Análise</strong>
            </div>

            <ArrowRight size={17} />
          </Link>

        </div>

      </div>
    </DocumentationLayout>
  );
}  
 
 