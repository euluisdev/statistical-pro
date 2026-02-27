import ControlChart from "./ControlChart";

export default async function Page({ params }) {

  const resolvedParams = await params;
  
  return <ControlChart params={resolvedParams} />;
}