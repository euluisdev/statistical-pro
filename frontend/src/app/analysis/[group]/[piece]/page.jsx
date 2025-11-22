import AnalysisClient from "./AnalysisClient";

export default async function Page({ params }) {

  const resolvedParams = await params;
  
  return <AnalysisClient params={resolvedParams} />;
}