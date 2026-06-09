import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Print as PrintIcon, PictureAsPdf as PdfIcon, Close as CloseIcon } from '@mui/icons-material';

/**
 * Renders the printable mortuary report.
 * @param {object} props - The component props.
 * @param {object} props.reportData - The data for the report.
 */
const PrintableReport = ({ reportData }) => {
  // Handles the print action for the report.
  const handlePrint = () => {
    window.print();
  };

  // Formats the findings object into a readable list.
  const formatFindings = (findings) => {
    if (!findings) return 'No findings available';
    
    try {
      if (typeof findings === 'object') {
        return Object.entries(findings).map(([key, value]) => (
          <div key={key}><strong>{key}:</strong> {value}</div>
        ));
      }
      
      const parsed = JSON.parse(findings);
      return Object.entries(parsed).map(([key, value]) => (
        <div key={key}><strong>{key}:</strong> {value}</div>
      ));
    } catch (e) {
      return findings;
    }
  };

  // Formats a date string to a locale-specific format.
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: '100vh', '@media print': { backgroundColor: 'white' } }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 4 }, 
          mb: 3, 
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)',
          '@media print': {
            boxShadow: 'none',
            p: 2,
            m: 0,
            overflow: 'visible'
          }
        }}
        id="report-content"
      >
        <Box sx={{ textAlign: 'center', mb: 4, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {reportData.mortuary || 'Mortuary'} Report
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Generated on: {new Date(reportData.timestamp).toLocaleString()}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            Report Period: {reportData.reportPeriod || 'All Records'}
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Executive Summary
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
            <Typography variant="body1">
              {reportData.aiReport}
            </Typography>
          </Paper>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Key Metrics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 1 }}>
                <Typography variant="h5" color="primary">
                  {reportData.totalCases || 0}
                </Typography>
                <Typography variant="body2">
                  Total Cases
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 1 }}>
                <Typography variant="h5" color="primary">
                  {reportData.averageStayDays ? reportData.averageStayDays.toFixed(2) : 'N/A'}
                </Typography>
                <Typography variant="body2">
                  Avg Stay (Days)
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 1 }}>
                <Typography variant="h5" color="primary">
                  {reportData.postmortems || 0}
                </Typography>
                <Typography variant="body2">
                  Postmortems
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 1 }}>
                <Typography variant="h5" color="primary">
                  {reportData.unclaimedBodies || 0}
                </Typography>
                <Typography variant="body2">
                  Unclaimed Bodies
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {reportData.deathSources && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Death Sources
            </Typography>
            <Grid container spacing={1}>
              {Object.entries(reportData.deathSources).map(([source, count]) => (
                <Grid item key={source}>
                  <Chip 
                    label={`${source}: ${count}`} 
                    variant="outlined"
                    color="primary"
                    sx={{ borderRadius: '4px' }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {reportData.deathsByCounty && reportData.deathsByCounty.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Deaths by County
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>County</TableCell>
                    <TableCell align="right">Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.deathsByCounty.map((countyData, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        {countyData.county}
                      </TableCell>
                      <TableCell align="right">{countyData.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {reportData.monthlyTrends && reportData.monthlyTrends.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Monthly Trends
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell align="right">Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.monthlyTrends.map((trend, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        {trend.month_year || 'Unknown'}
                      </TableCell>
                      <TableCell align="right">{trend.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {reportData.avgStayByCause && reportData.avgStayByCause.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Average Stay by Cause of Death
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cause of Death</TableCell>
                    <TableCell align="right">Avg Stay (Days)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.avgStayByCause.map((causeData, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        {causeData.cause_of_death}
                      </TableCell>
                      <TableCell align="right">
                        {causeData.avg_stay ? causeData.avg_stay.toFixed(2) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {reportData.deceasedData && reportData.deceasedData.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Deceased Records (Sample)
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>County</TableCell>
                    <TableCell>Date of Death</TableCell>
                    <TableCell>Cause of Death</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.deceasedData.slice(0, 5).map((deceased, index) => (
                    <TableRow key={index}>
                      <TableCell>{deceased.full_name}</TableCell>
                      <TableCell>{deceased.county}</TableCell>
                      <TableCell>{formatDate(deceased.date_of_death)}</TableCell>
                      <TableCell>{deceased.cause_of_death}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {reportData.deceasedData.length > 5 && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                Showing 5 of {reportData.deceasedData.length} records
              </Typography>
            )}
          </Box>
        )}
      </Paper>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #report-content, #report-content * {
              visibility: visible;
            }
            #report-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 15px;
            }
          }
        `}
      </style>
    </Box>
  );
};

const ReportGenerator= () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetches report data from the API.
  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = 'http://localhost:8009/api/v1/restpoint/moltuary-analytics/generate-report';
      
      if (reportType === 'custom' && startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      } else if (reportType === 'yearly') {
        const year = new Date().getFullYear();
        url += `?year=${year}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setReportData(data);
      setOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to generate report. Please try again.');
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateClick = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setError(null);
  };

  if (reportData) {
    return (
      <Box>
        <PrintableReport reportData={reportData} />
        <Box 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            p: 2, 
            backgroundColor: 'white',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            zIndex: 1000,
            '@media print': { display: 'none' }
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ 
              borderRadius: '8px', 
              py: 1.5, 
              px: 4,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            }}
          >
            Print Report
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<CloseIcon />}
            onClick={() => setReportData(null)}
            sx={{ borderRadius: '8px' }}
          >
            Close
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <Box sx={{ maxWidth: 600, width: '100%' }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" color="primary" sx={{ fontWeight: 'bold', mb: 3 }}>
          Mortuary Analytics Report
        </Typography>
        
        <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            Generate comprehensive reports from mortuary analytics data. Select your report criteria and generate a printable report.
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            onClick={handleGenerateClick}
            startIcon={<PdfIcon />}
            sx={{ 
              borderRadius: '8px', 
              py: 1.5, 
              px: 4,
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            }}
          >
            Generate Report
          </Button>
        </Paper>

        <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
            Generate Report
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="all">All Records</MenuItem>
                <MenuItem value="custom">Custom Date Range</MenuItem>
                <MenuItem value="yearly">This Year</MenuItem>
              </Select>
            </FormControl>

            {reportType === 'custom' && (
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth>
                  <InputLabel shrink>Start Date</InputLabel>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ 
                      padding: '16.5px 14px', 
                      borderRadius: '4px', 
                      border: '1px solid #c4c4c4',
                      fontSize: '1rem',
                      fontFamily: 'Roboto, sans-serif'
                    }}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel shrink>End Date</InputLabel>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ 
                      padding: '16.5px 14px', 
                      borderRadius: '4px', 
                      border: '1px solid #c4c4c4',
                      fontSize: '1rem',
                      fontFamily: 'Roboto, sans-serif'
                    }}
                  />
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={fetchReportData} 
              disabled={loading || (reportType === 'custom' && (!startDate || !endDate))}
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Generating...' : 'Generate'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};



export default ReportGenerator;