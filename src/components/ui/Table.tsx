'use client'

import { ReactNode, HTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface TableProps<T> extends HTMLAttributes<HTMLDivElement> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string | number
  onRowClick?: (item: T) => void
  sortKey?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (key: string) => void
  emptyMessage?: string
  isLoading?: boolean
}

function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  sortKey,
  sortDirection,
  onSort,
  emptyMessage = 'Nessun dato disponibile',
  isLoading = false,
  className,
  ...props
}: TableProps<T>) {
  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null

    if (sortKey === column.key) {
      return sortDirection === 'asc' ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      )
    }

    return <ChevronsUpDown className="w-4 h-4 opacity-40" />
  }

  return (
    <div className={clsx('table-container bg-surface', className)} {...props}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
                className={clsx(
                  column.sortable && 'cursor-pointer select-none hover:bg-background-secondary/50',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right'
                )}
                onClick={() => column.sortable && onSort?.(column.key)}
              >
                <div className={clsx(
                  'flex items-center gap-1',
                  column.align === 'center' && 'justify-center',
                  column.align === 'right' && 'justify-end'
                )}>
                  {column.header}
                  {renderSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8">
                <div className="flex items-center justify-center gap-2 text-foreground-muted">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Caricamento...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-foreground-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={clsx(onRowClick && 'cursor-pointer')}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={clsx(
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                  >
                    {column.render
                      ? column.render(item)
                      : (item as Record<string, unknown>)[column.key] as ReactNode}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// Pagination component
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  itemsPerPage?: number
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  const getVisiblePages = () => {
    if (totalPages <= 7) return pages

    if (currentPage <= 3) {
      return [...pages.slice(0, 5), -1, totalPages]
    }

    if (currentPage >= totalPages - 2) {
      return [1, -1, ...pages.slice(totalPages - 5)]
    }

    return [1, -1, currentPage - 1, currentPage, currentPage + 1, -2, totalPages]
  }

  return (
    <div className="flex items-center justify-between px-2 py-3">
      {totalItems !== undefined && itemsPerPage !== undefined && (
        <p className="text-sm text-foreground-muted">
          Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} -{' '}
          {Math.min(currentPage * itemsPerPage, totalItems)} di {totalItems} risultati
        </p>
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm rounded-lg hover:bg-background-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prec.
        </button>

        {getVisiblePages().map((page, index) =>
          page < 0 ? (
            <span key={page} className="px-2 text-foreground-muted">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={clsx(
                'w-8 h-8 text-sm rounded-lg transition-colors',
                currentPage === page
                  ? 'bg-primary text-white'
                  : 'hover:bg-background-secondary'
              )}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-sm rounded-lg hover:bg-background-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Succ.
        </button>
      </div>
    </div>
  )
}

export { Table, Pagination }
export type { TableProps, Column, PaginationProps }
