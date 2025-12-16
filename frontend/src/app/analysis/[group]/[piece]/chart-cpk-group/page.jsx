import ChartCpkGroup from "./ChartCpkGroup";

export default async function Page({ params }) {
  const resolvedParams = await params;
  return <ChartCpkGroup params={resolvedParams} />;
}  
 
 