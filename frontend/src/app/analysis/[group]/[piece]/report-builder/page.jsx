import ReportBuilder from "./ReportBuilder";

export default async function Page({ params }) {

  const resolvedParams = await params;
  
  return <ReportBuilder params={resolvedParams} />;
}