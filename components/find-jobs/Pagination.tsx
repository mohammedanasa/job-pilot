const pageButtonClass =
  "flex h-9 min-w-9 items-center justify-center rounded-md border border-border px-3 text-sm font-medium leading-5 text-text-primary";

export function Pagination() {
  return (
    <div className="flex flex-col gap-3 border-t border-border p-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm font-medium leading-5 text-text-secondary">
        Showing <span className="font-semibold text-text-primary">1</span> to{" "}
        <span className="font-semibold text-text-primary">6</span> of{" "}
        <span className="font-semibold text-text-primary">24</span> results
      </p>

      <div className="flex items-center gap-2">
        <span className={`${pageButtonClass} text-text-muted`}>Previous</span>
        <span className={`${pageButtonClass} border-accent bg-accent-light text-accent`}>1</span>
        <span className={pageButtonClass}>2</span>
        <span className={pageButtonClass}>3</span>
        <span className="px-1 text-sm font-medium leading-5 text-text-muted">...</span>
        <span className={pageButtonClass}>8</span>
        <span className={pageButtonClass}>Next</span>
      </div>
    </div>
  );
}
