import ChartCpGroup from "./ChartCpGroup";

export default async function Page({ params }) {
  const resolvedParams = await params;
  return <ChartCpGroup params={resolvedParams} />;
}  
 
 