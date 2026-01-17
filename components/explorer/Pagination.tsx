"use client";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass p-4">
      <div className="text-sm text-zinc-400 font-mono">
        Showing <span className="text-white">{start}</span>–<span className="text-white">{end}</span> of{" "}
        <span className="text-white">{total}</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
          className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${
            canPrev ? "bg-white/10 hover:bg-white/20 text-white" : "bg-white/5 text-zinc-600 cursor-not-allowed"
          }`}
        >
          Prev
        </button>

        <span className="text-xs text-zinc-400 font-mono">
          Page <span className="text-white">{page}</span> / <span className="text-white">{totalPages}</span>
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
          className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${
            canNext ? "bg-orange-500 text-black hover:bg-orange-400" : "bg-white/5 text-zinc-600 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
