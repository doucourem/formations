import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

export default function TopDrivers({ drivers }) {
    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Chauffeur</TableCell>
                    <TableCell>Revenus</TableCell>
                    <TableCell>Tickets</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {drivers.map(d => (
                    <TableRow key={d.name}>
                        <TableCell>{d.name}</TableCell>
                        <TableCell>{d.revenue}</TableCell>
                        <TableCell>{d.tickets}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
