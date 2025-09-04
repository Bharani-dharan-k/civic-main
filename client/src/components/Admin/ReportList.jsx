import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';

const getStatusColor = (status) => {
    switch (status) {
        case 'Resolved':
            return 'success';
        case 'In Progress':
            return 'warning';
        case 'Submitted':
            return 'info';
        case 'Rejected':
            return 'error';
        default:
            return 'default';
    }
};

const ReportList = ({ reports }) => {
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Reported On</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(reports && reports.length > 0) ? reports.slice(0, 10).map((report) => ( // Show latest 10
                        <TableRow
                            key={report._id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {report.title}
                            </TableCell>
                            <TableCell>{report.category}</TableCell>
                            <TableCell>
                                <Chip label={report.status} color={getStatusColor(report.status)} size="small" />
                            </TableCell>
                            <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={4} align="center">No reports found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ReportList;