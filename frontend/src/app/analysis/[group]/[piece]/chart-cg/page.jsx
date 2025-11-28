import ChatCgt from "./ChartCg";

export default async function Page({ params }) {

  const resolvedParams = await params;
  
  return <ChatCgt params={resolvedParams} />;
}