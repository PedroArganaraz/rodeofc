export function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1 p-6 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
      <p className="text-sm font-medium text-neutral-500">Próximamente</p>
    </div>
  );
}
