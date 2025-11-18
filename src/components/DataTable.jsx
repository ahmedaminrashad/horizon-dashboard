import React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'

function DataTable({ 
  data, 
  columns, 
  loading = false, 
  emptyMessage = 'No data available',
  pagination,
  onPaginationChange,
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // Enable server-side pagination
    pageCount: pagination?.totalPages || 0,
    state: {
      pagination: {
        pageIndex: (pagination?.page || 1) - 1, // Convert 1-based to 0-based
        pageSize: pagination?.limit || 10,
      },
    },
    onPaginationChange: (updater) => {
      if (onPaginationChange) {
        const newPagination = typeof updater === 'function' 
          ? updater({ pageIndex: (pagination?.page || 1) - 1, pageSize: pagination?.limit || 10 })
          : updater
        // Convert 0-based to 1-based for API
        onPaginationChange({
          page: newPagination.pageIndex + 1,
          limit: newPagination.pageSize,
        })
      }
    },
  })

  if (loading) {
    return (
      <div className="table-container">
        <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
          Loading...
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="table-container">
        <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
          {emptyMessage}
        </div>
      </div>
    )
  }

  return (
    <div className="table-container">
      <table className="users-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    width: header.getSize(),
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="table-pagination">
          <div className="pagination-info">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
            of {pagination.total} results
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => onPaginationChange && onPaginationChange({ page: 1, limit: pagination.limit })}
              disabled={!pagination.hasPreviousPage}
            >
              First
            </button>
            <button
              className="pagination-btn"
              onClick={() => onPaginationChange && onPaginationChange({ page: pagination.page - 1, limit: pagination.limit })}
              disabled={!pagination.hasPreviousPage}
            >
              Previous
            </button>
            <span className="pagination-page-info">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={() => onPaginationChange && onPaginationChange({ page: pagination.page + 1, limit: pagination.limit })}
              disabled={!pagination.hasNextPage}
            >
              Next
            </button>
            <button
              className="pagination-btn"
              onClick={() => onPaginationChange && onPaginationChange({ page: pagination.totalPages, limit: pagination.limit })}
              disabled={!pagination.hasNextPage}
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable

