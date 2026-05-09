"use client";

type DashboardErrorProps = {
  reset: () => void;
};

export default function DashboardError({ reset }: DashboardErrorProps) {
  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-primary">
        No se pudo cargar el dashboard
      </h2>
      <p className="mt-2 max-w-xl text-sm text-slate-600">
        Hubo un problema al consultar los datos operativos. Intenta recargar la
        vista.
      </p>
      <button
        className="mt-4 h-9 rounded-md bg-primary px-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        type="button"
        onClick={() => reset()}
      >
        Reintentar
      </button>
    </section>
  );
}
