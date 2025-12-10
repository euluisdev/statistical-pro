import ChartCgGroup from "./ChartCgGroup";

export default async function Page({ params }) {

  const resolvedParams = await params;
  
  return <ChartCgGroup params={resolvedParams} />;
}