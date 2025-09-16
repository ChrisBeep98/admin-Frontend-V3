import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  MenuItem,
  Button
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { getAllBookings, updateBooking, deleteBooking, getAllTours } from '../services/api';

interface Booking {
  id: number;
  tour_id: number;
  full_name: string;
  document?: string;
  phone: string;
  nationality: string;
  note?: string;
  number_of_people: number;
  departure_date: string;
  applied_price: number;
  status: 'pending' | 'confirmed' | 'canceled';
  created_at: string;
}

interface Tour {
  id: number;
  name: string;
}

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    status: 'pending' as 'pending' | 'confirmed' | 'canceled',
    note: ''
  });

  useEffect(() => {
    loadBookings();
    loadTours();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const filters = statusFilter ? { status: statusFilter } : undefined;
      const data = await getAllBookings(filters);
      setBookings(data);
      setError('');
    } catch (err) {
      setError('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadTours = async () => {
    try {
      const data = await getAllTours();
      setTours(data);
    } catch (err) {
      console.error('Error loading tours:', err);
    }
  };

  const getTourName = (tourId: number) => {
    const tour = tours.find(t => t.id === tourId);
    return tour ? tour.name : `Tour #${tourId}`;
  };

  const handleOpenDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setFormData({
      status: booking.status,
      note: booking.note || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBooking(null);
  };

  const handleSubmit = async () => {
    if (selectedBooking) {
      try {
        await updateBooking({
          id: selectedBooking.id,
          status: formData.status,
          note: formData.note
        });
        handleCloseDialog();
        loadBookings();
      } catch (err) {
        setError('Error updating booking');
      }
    }
  };

  const handleDelete = async () => {
    if (bookingToDelete) {
      try {
        await deleteBooking(bookingToDelete.id);
        setDeleteConfirmOpen(false);
        setBookingToDelete(null);
        loadBookings();
      } catch (err) {
        setError('Error deleting booking');
      }
    }
  };

  const getStatusColor = (status: Booking['status']): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'canceled': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Bookings Management
          </Typography>
          <TextField
            select
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="canceled">Canceled</MenuItem>
          </TextField>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Tour</TableCell>
                  <TableCell>People</TableCell>
                  <TableCell>Departure</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{booking.full_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.nationality} • {booking.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{getTourName(booking.tour_id)}</TableCell>
                    <TableCell>{booking.number_of_people}</TableCell>
                    <TableCell>{new Date(booking.departure_date).toLocaleDateString()}</TableCell>
                    <TableCell>${booking.applied_price}</TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status}
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog(booking)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          setBookingToDelete(booking);
                          setDeleteConfirmOpen(true);
                        }}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Booking Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Booking</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6">Customer: {selectedBooking.full_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Tour: {getTourName(selectedBooking.tour_id)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  People: {selectedBooking.number_of_people} • Price: ${selectedBooking.applied_price}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="canceled">Canceled</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Add any notes about this booking..."
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Update Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the booking for "{bookingToDelete?.full_name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingsPage;