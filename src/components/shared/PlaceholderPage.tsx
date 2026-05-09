import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";

type PlaceholderPageProps = {
  title: string;
  description: string;
  status?: string;
};

export function PlaceholderPage({
  title,
  description,
  status = "Pendiente"
}: PlaceholderPageProps) {
  return (
    <section>
      <PageHeader title={title} description={description} />
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <StatusBadge variant="info">{status}</StatusBadge>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
          Esta superficie ya esta integrada en el layout y la navegacion por rol.
          La logica funcional se implementara en su fase correspondiente del
          roadmap.
        </p>
      </div>
    </section>
  );
}
