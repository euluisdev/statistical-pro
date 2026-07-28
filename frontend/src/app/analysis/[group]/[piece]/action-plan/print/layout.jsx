// app/analysis/[group]/[piece]/action-plan/print/layout.jsx
//
//layout isolado para a rota de print
//remove qualquer shell do sistema
//a lib playwright verá apenas a tabela — nada mais
 
export const metadata = { title: "Action Plan — Print" };
 
export default function PrintLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, background: "#fff" }}>
        {children}
      </body>
    </html>
  );
}  
 

 