import ChartCpCpk from "./ChartCpCpk";

export default async function Page({ params }) {
  const resolvedParams = await params;
  return <ChartCpCpk params={resolvedParams} />;
}