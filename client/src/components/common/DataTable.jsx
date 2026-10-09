import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

export default function DataTable({
  columns, rows, sortBy, sortDir, onSort, page, pages, total, onPage, empty, loading,
}) {
  if (loading) {
    return (
      <div className="divide-y divide-line/60">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="h-3 flex-1 rounded bg-slate-100" />
            <div className="h-3 w-24 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (!rows?.length) return <div className="px-5 py-10">{empty}</div>;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-page/60">
              {columns.map((c) => (
                <th key={c.key} scope="col" className={`whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${c.className || ''}`}>
                  {onSort && c.key !== 'actions' ? (
                    <button onClick={() => onSort(c.key)} className="flex items-center gap-1 hover:text-navy">
                      {c.header}
                      <ArrowUpDown className="h-3 w-3 text-slate-300" />
                      {sortBy === c.key && <span className="text-brand-500">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {rows.map((row, i) => (
              <tr key={row._id || i} className="transition hover:bg-brand-50/30">
                {columns.map((c) => (
                  <td key={c.key} className={`px-5 py-3.5 ${c.className || ''}`}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-line px-5 py-3">
          <p className="text-xs text-muted">
            Page {page} of {pages} · {total} records
          </p>
          <div className="flex gap-1">
            <button onClick={() => onPage(page - 1)} disabled={page <= 1} className="btn-ghost p-2" aria-label="Previous page">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => onPage(page + 1)} disabled={page >= pages} className="btn-ghost p-2" aria-label="Next page">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
