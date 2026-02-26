import ChartCg from "./ChartCg";

export default async function Page({ params }) {

  const resolvedParams = await params;
  
  return <ChartCg params={resolvedParams} />;
}