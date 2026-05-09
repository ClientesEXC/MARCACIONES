export default function DashboardLoading() {
  return (
    <section className="space-y-6">
      <div>
        <div className="h-8 w-48 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-full max-w-lg rounded bg-slate-100" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="rounded-lg border bg-white p-5 shadow-sm" key={index}>
            <div className="h-4 w-28 rounded bg-slate-100" />
            <div className="mt-3 h-9 w-16 rounded bg-slate-200" />
            <div className="mt-4 h-6 w-14 rounded bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(22rem,0.75fr)]">
        <div className="h-96 rounded-lg border bg-white p-5 shadow-sm">
          <div className="h-5 w-40 rounded bg-slate-200" />
          <div className="mt-8 h-64 rounded bg-slate-100" />
        </div>
        <div className="h-96 rounded-lg border bg-white p-5 shadow-sm">
          <div className="h-5 w-40 rounded bg-slate-200" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="h-14 rounded bg-slate-100" key={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
