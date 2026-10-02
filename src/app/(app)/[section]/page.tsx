export default async function NotBuilt(props: { params: Promise<{ section: string }> }) {
  const { section } = await props.params;
  const name = section.replace(/-/g, " ").replace(/^\w/, c => c.toUpperCase());
  return (<div className="mx-auto mt-16 max-w-md rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
    <h1 className="text-xl font-semibold">{name}</h1>
    <p className="mt-2 text-sm text-slate-500">This part of the system hasn't been built yet. Use the Dashboard, Reservations or Rooms for now.</p></div>);
}