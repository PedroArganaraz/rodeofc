import { EquipoTabs } from "@/components/equipo-tabs";

export default function EquipoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <EquipoTabs />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
