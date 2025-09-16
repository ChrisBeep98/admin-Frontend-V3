import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  Alert
} from '@mui/material';
import {
  TravelExplore as ToursIcon,
  BookOnline as BookingsIcon,
  Schedule as ItinerariesIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAllTours, getAllBookings } from '../services/api';

const DashboardPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTours: 0,
    activeTours: 0,
    totalBookings: 0,
    pendingBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [toursData, bookingsData] = await Promise.all([
        getAllTours(),
        getAllBookings()
      ]);

      setStats({
        totalTours: toursData.length,
        activeTours: toursData.filter((t: any) => t.status === 'active').length,
        totalBookings: bookingsData.length,
        pendingBookings: bookingsData.filter((b: any) => b.status === 'pending').length
      });
    } catch (err) {
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Tours Management',
      description: 'Create, edit, and manage tours',
      icon: <ToursIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/tours'),
      stats: `${stats.activeTours} active / ${stats.totalTours} total`
    },
    {
      title: 'Bookings Management',
      description: 'View and manage customer bookings',
      icon: <BookingsIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/bookings'),
      stats: `${stats.pendingBookings} pending / ${stats.totalBookings} total`
    },
    {
      title: 'Itineraries Management',
      description: 'Manage day-by-day tour activities',
      icon: <ItinerariesIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/itineraries'),
      stats: 'Coming soon'
    }
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Nevado Trek Admin Dashboard
          </Typography>
          <Button variant="outlined" color="secondary" onClick={logout}>
            Logout
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Typography variant="h6" sx={{ mb: 3 }}>
          Welcome to the administration panel!
        </Typography>

        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {action.icon}
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {action.description}
                  </Typography>
                  <Typography variant="caption" color="primary">
                    {action.stats}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button 
                    variant="contained" 
                    onClick={action.action}
                    disabled={action.stats === 'Coming soon'}
                  >
                    Open
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {!loading && (
          <Paper sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="h4" color="primary">{stats.totalTours}</Typography>
                <Typography variant="body2">Total Tours</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="h4" color="success.main">{stats.activeTours}</Typography>
                <Typography variant="body2">Active Tours</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="h4" color="info.main">{stats.totalBookings}</Typography>
                <Typography variant="body2">Total Bookings</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="h4" color="warning.main">{stats.pendingBookings}</Typography>
                <Typography variant="body2">Pending Bookings</Typography>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default DashboardPage;
