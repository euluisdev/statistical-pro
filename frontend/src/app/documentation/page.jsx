"use client";

import { Grid3x3, House } from "lucide-react";
import "./documentation-help.css";

export default function DocumentationHomePage() {
  return (
    <div className="doc-page">
      <header className="doc-header">
        <h1>SIX SIGMA</h1>
        <p>Guia de Uso — Página Inicial (Home)</p>
      </header>

      <section className="doc-section">
        <h2>Objetivo da Página</h2>
        <p>
          A Página Inicial é o ponto de partida do sistema SIX SIGMA.
          Nela você executa todo o fluxo básico necessário para iniciar
          uma análise estatística sem necessidade de treinamento prévio.
        </p>

        <ul>
          <li>Criar e gerenciar grupos</li>
          <li>Criar e gerenciar peças</li>
          <li>Importar arquivos TXT de medição</li>
          <li>Visualizar dados extraídos</li>
          <li>Avançar para qualquer página do sistema</li>
        </ul>
      </section>

      <section className="doc-section">
        <h2>Estrutura da Tela</h2>
        <p>A página é dividida em três módulos principais:</p>

        <ol>
          <li><strong>Gerenciador de Grupos</strong></li>
          <li><strong>Gerenciador de Peças</strong></li>
          <li><strong>Gerenciador de Arquivos TXT</strong></li>
        </ol>

        <p>
          Abaixo desses módulos existe uma barra de ações com botões para navegação
          e, ao final da página, a tabela de dados extraídos.
        </p>
      </section>

      <section className="doc-section">
        <h2>Gerenciador de Grupos</h2>

        <p>
          Um <strong>Conjunto</strong> representa um template lógico de peças,
          como um produto, projeto ou família de componentes do carro.
        </p>

        <h3>Funcionalidades</h3>
        <ul>
          <li>Criar novo grupo</li>
          <li>Selecionar grupo existente</li>
          <li>Excluir grupo</li>
        </ul>

        <h3>Como usar</h3>
        <ol>
          <li>Digite o nome do grupo</li>
          <li>Clique em <strong>Adicionar</strong></li>
          <li>Selecione o grupo na lista</li>
        </ol>

        <div className="doc-alert">
          Ao selecionar um grupo, o sistema carrega automaticamente
          todas as peças vinculadas a ele.
        </div>
      </section>

      <section className="doc-section">
        <h2>Gerenciador de Peças</h2>

        <p>
          Uma <strong>Peça</strong> representa o item físico
          que será analisado dentro de um grupo.
        </p>

        <div className="doc-warning">
          É obrigatório selecionar um grupo antes de criar uma peça.
        </div>

        <h3>Funcionalidades</h3>
        <ul>
          <li>Criar nova peça</li>
          <li>Selecionar peça existente</li>
          <li>Excluir peça</li>
        </ul>

        <h3>Como usar</h3>
        <ol>
          <li>Selecione um grupo</li>
          <li>Digite o nome da peça</li>
          <li>Clique em <strong>Adicionar</strong></li>
          <li>Selecione a peça criada</li>
        </ol>
      </section>

      <section className="doc-section">
        <h2>Importação de Arquivos TXT</h2>

        <p>
          Este módulo permite importar arquivos de medição
          no formato <strong>.txt</strong>.
        </p>

        <h3>Pré-requisitos</h3>
        <ul>
          <li>Grupo selecionado</li>
          <li>Peça selecionada</li>
        </ul>

        <h3>Fluxo de uso</h3>
        <ol>
          <li>Selecionar o arquivo TXT</li>
          <li>Aguardar a leitura automática</li>
          <li>Visualizar os dados extraídos</li>
        </ol>

        <div className="doc-alert">
          Os dados extraídos são armazenados temporariamente
          no navegador e exibidos em formato de tabela.
        </div>
      </section>

      <section className="doc-section">
        <h2>Tabela de Dados Extraídos</h2>

        <p>
          Após a importação, os dados são exibidos em uma tabela dinâmica.
        </p>

        <ul>
          <li>As colunas são geradas automaticamente</li>
          <li>Os valores refletem exatamente o conteúdo do TXT</li>
          <li>A tabela serve para validação antes da análise</li>
        </ul>
      </section>

      <section className="doc-section">
        <h2>Barra de Ações</h2>

        <table>
          <thead>
            <tr>
              <th>Ícone</th>
              <th>Função</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><House /></td>
              <td>Reseta todo o fluxo da página</td>
            </tr>
            <tr>
              <td><Grid3x3 /></td>
              <td>Avança para a página de Análise</td>
            </tr>
            <tr>
              <td>📊</td>
              <td>Funcionalidades futuras</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="doc-section">
        <h2>Fluxo Completo de Uso</h2>

        <ol>
          <li>Criar grupo</li>
          <li>Selecionar grupo</li>
          <li>Criar peça</li>
          <li>Selecionar peça</li>
          <li>Importar arquivo TXT</li>
          <li>Validar dados</li>
          <li>Ir para Análise</li>
        </ol>
      </section>

      <footer className="doc-footer">
        <p>Sistema SIX SIGMA — Documentação Interna</p>
      </footer>
    </div>
  );
}
  
 