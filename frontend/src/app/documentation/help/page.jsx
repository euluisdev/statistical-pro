"use client";

import Link from "next/link";
import {
  CircleHelp,
  AlertTriangle,
  RefreshCw,
  FileWarning,
  PlayCircle,
  ArrowRight,
} from "lucide-react";

import DocumentationLayout from "../components/DocumentationLayout";
import "../documentation.css";
import "./help.css";

export default function DocumentationHelpPage() {
  return (
    <DocumentationLayout>
      <div className="doc-page">

        <header className="doc-header">
          <h1>Ajuda / FAQ</h1>

          <p>
            Consulte as dúvidas mais comuns durante a utilização do
            sistema SIX SIGMA.
          </p>
        </header>


        <section className="doc-section">
          <h2>Problemas comuns</h2>


          <div className="faq-item">
            <div className="faq-question">
              <CircleHelp size={19} />
              <strong>Não consigo gerar a análise. O que devo verificar?</strong>
            </div>

            <p>
              Confirme se a peça está selecionada, se os arquivos TXT foram
              importados e se os dados foram extraídos corretamente.
            </p>
          </div>


          <div className="faq-item">
            <div className="faq-question">
              <CircleHelp size={19} />
              <strong>Não aparecem arquivos no histórico.</strong>
            </div>

            <p>
              O histórico apresenta as semanas que possuem análises
              disponíveis. Verifique se a análise da semana desejada
              já foi gerada.
            </p>
          </div>


          <div className="faq-item">
            <div className="faq-question">
              <CircleHelp size={19} />
              <strong>O Report Builder informa que não existe Job.</strong>
            </div>

            <p>
              O Report Builder depende de um Job ativo para acessar os
              gráficos armazenados durante o estudo. Volte à Página Inicial
              e crie um Job antes de continuar.
            </p>
          </div>


          <div className="faq-item">
            <div className="faq-question">
              <CircleHelp size={19} />
              <strong>Meu gráfico não aparece no Report Builder.</strong>
            </div>

            <p>
              Verifique se o gráfico foi salvo no Job atual. Apenas os
              gráficos associados ao Job podem ser disponibilizados na
              biblioteca do relatório.
            </p>
          </div>


          <div className="faq-item">
            <div className="faq-question">
              <CircleHelp size={19} />
              <strong>Posso apagar um arquivo TXT?</strong>
            </div>

            <p>
              Sim. Selecione o arquivo na lista e utilize a opção de
              exclusão. A operação possui confirmação antes de ser executada.
            </p>
          </div>


          <div className="faq-item">
            <div className="faq-question">
              <CircleHelp size={19} />
              <strong>Posso reutilizar um relatório?</strong>
            </div>

            <p>
              Sim. O Report Builder permite trabalhar com templates e
              snapshots salvos.
            </p>
          </div>

        </section>


        <section className="doc-section">
          <h2>Se algo não funcionar</h2>

          <div className="help-warning">
            <AlertTriangle size={22} />

            <div>
              <strong>Antes de solicitar suporte</strong>

              <ol>
                <li>Verifique se o conjunto está selecionado.</li>
                <li>Verifique se a peça está selecionada.</li>
                <li>Confira os arquivos TXT.</li>
                <li>Confira a semana e o ano selecionados.</li>
                <li>Verifique se existe um Job ativo.</li>
                <li>Tente atualizar a página.</li>
              </ol>
            </div>
          </div>
        </section>


        <section className="doc-section">
          <h2>Mensagens importantes</h2>

          <div className="help-grid">

            <div className="help-card">
              <FileWarning size={22} />
              <strong>Dados ausentes</strong>
              <span>
                Verifique os arquivos de medição e a extração dos dados.
              </span>
            </div>

            <div className="help-card">
              <PlayCircle size={22} />
              <strong>Job</strong>
              <span>
                Algumas funções dependem de um Job ativo.
              </span>
            </div>

            <div className="help-card">
              <RefreshCw size={22} />
              <strong>Atualização</strong>
              <span>
                Atualize a página quando necessário para recarregar
                informações.
              </span>
            </div>

          </div>
        </section>


        <section className="doc-section">
          <h2>Suporte</h2>

          <p>
            Caso o problema persista, registre o máximo de informações
            possível: conjunto, peça, semana, etapa do processo e mensagem
            apresentada pelo sistema.
          </p>

          <p>
            Essas informações facilitam a identificação e correção
            do problema.
          </p>
        </section>


        <div className="doc-page-navigation">
          <Link
            href="/documentation/concepts"
            className="doc-navigation-link"
          >
            ← Conceitos
          </Link>

          <Link
            href="/documentation"
            className="doc-navigation-link doc-navigation-next"
          >
            Início da Documentação →
          </Link>
        </div>

      </div>
    </DocumentationLayout>
  );
}  
 
 