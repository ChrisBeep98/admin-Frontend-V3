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
  Button,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { getAllBookings, updateBooking, deleteBooking, getAllTours } from '../services/api';
import BookingDetailsDialog from '../components/BookingDetailsDialog';

interface Booking {
  id: number;
  tour_id: number | null;
  full_name: string;
  document?: string;
  phone: string;
  nationality: string;
  note?: string;
  number_of_people: number;
  departure_date: string;
  applied_price: number;
  status: 'pending' | 'confirmed' | 'canceled' | 'unpaired';
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
    tour_id: null as number | null,
    status: 'pending' as 'pending' | 'confirmed' | 'canceled' | 'unpaired',
    full_name: '' as string,
    note: '',
    document: '' as string,
    phone: '' as string,
    nationality: '' as string,
    number_of_people: '' as string,
    applied_price: '' as string, // keep as text for input control
    departure_date: '' as string // YYYY-MM-DD
  });

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
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

  const getTourName = (tourId: number | null) => {
  if (tourId == null) return 'Unpaired';
  const tour = tours.find(t => t.id === tourId);
  return tour ? tour.name : `Tour #${tourId}`;
  };

  const handleOpenDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBooking(null);
  };

  // No longer used: updates handled by shared dialog
  // Keeping function in case of future inline updates
  const handleSubmit = async () => {
    return;
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
      case 'unpaired': return 'warning';
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
            <MenuItem value="unpaired">Unpaired</MenuItem>
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
                  <TableRow
                    key={booking.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleOpenDialog(booking)}
                  >
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
                    <TableCell>{booking.departure_date}</TableCell>
                    <TableCell>${booking.applied_price}</TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status}
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => { e.stopPropagation(); handleOpenDialog(booking); }} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
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

      <BookingDetailsDialog
        open={openDialog}
        booking={selectedBooking}
        tours={tours}
        onClose={handleCloseDialog}
        onSaved={loadBookings}
      />

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
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setToast((prev) => ({ ...prev, open: false }))} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BookingsPage;