import React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Stack, Button, IconButton, Tooltip, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

/**
 * DataTablePro
 * @param {Array} columns - [{ field, label, render, sortable }]
 * @param {Array} data - les lignes
 * @param {Array} actions - [{ label, icon, color, onClick }]
 * @param {Object} pagination - { current_page, last_page, prev_page_url, next_page_url, links: [{ label, url, active }] }
 * @param {Function} onPageChange - callback pagination
 * @param {Function} onSort - callback tri
 * @param {String} sortField - champ tri actuel
 * @param {String} sortDirection - "asc" ou "desc"
 */
export default function DataTablePro({
  columns = [],
  data = [],
  actions = [],
  pagination = null,
  onPageChange = () => {},
  onSort = () => {},
  sortField = '',
  sortDirection = 'asc',
}) {

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
  };

  const handlePageChange = (url) => {
    if (url) onPageChange(url);
  };

  // Limiter à 5 pages visibles autour de la page courante
  const maxVisiblePages = 5;
  const filteredLinks = pagination?.links?.filter(link => {
    if (link.label === '&laquo;' || link.label === '&raquo;') return true;
    const pageNumber = parseInt(link.label.replace(/[^0-9]/g, ''), 10);
    const currentPage = pagination.current_page || 1;
    const start = Math.max(currentPage - 2, 1);
    const end = start + maxVisiblePages - 1;
    return pageNumber >= start && pageNumber <= end;
  }) || [];

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#1976d2' }}>
            <TableRow>
              {columns.map(col => (
                <TableCell
                  key={col.field}
                  sx={{ color: 'white', fontWeight: 'bold', cursor: col.sortable ? 'pointer' : 'default' }}
                  onClick={col.sortable ? () => onSort(col.field) : undefined}
                >
                  {col.label} {col.sortable && renderSortIcon(col.field)}
                </TableCell>
              ))}
              {actions.length > 0 && <TableCell align="center" sx={{ color: 'white' }}>Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {data.length > 0 ? data.map(row => (
              <TableRow key={row.id} hover>
                {columns.map(col => (
                  <TableCell key={col.field}>
                    {col.render ? col.render(row[col.field], row) : row[col.field] ?? '-'}
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell>
                    <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                      {actions.map((action, idx) => (
                        <Tooltip key={idx} title={action.label}>
                          <IconButton color={action.color || 'default'} size="small" onClick={() => action.onClick(row)}>
                            {action.icon}
                          </IconButton>
                        </Tooltip>
                      ))}
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} align="center">
                  <Typography sx={{ py: 2 }}>Aucune donnée disponible</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && pagination.links.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            disabled={!pagination.prev_page_url}
            onClick={() => handlePageChange(pagination.prev_page_url)}
            size="small"
          >
            Précédent
          </Button>

          {filteredLinks.map((link, i) => {
            if (link.label === '&laquo;' || link.label === '&raquo;') return null;
            return (
              <Button
                key={i}
                disabled={!link.url}
                onClick={() => handlePageChange(link.url)}
                dangerouslySetInnerHTML={{ __html: link.label }}
                variant={link.active ? 'contained' : 'outlined'}
                size="small"
              />
            );
          })}

          <Button
            disabled={!pagination.next_page_url}
            onClick={() => handlePageChange(pagination.next_page_url)}
            size="small"
          >
            Suivant
          </Button>
        </Stack>
      )}
    </Box>
  );
}
