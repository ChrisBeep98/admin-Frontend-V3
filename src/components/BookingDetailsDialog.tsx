import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button
} from '@mui/material';
import { updateBooking } from '../services/api';

export interface Booking {
  id: number;
  tour_id: number | null;
  full_name: string;
  document?: string;
  phone: string;
  nationality: string;
  note?: string;
  number_of_people: number;
  departure_date: string; // YYYY-MM-DD
  applied_price: number;
  status: 'pending' | 'confirmed' | 'canceled' | 'unpaired';
}

export interface Tour { id: number; name: string }

interface Props {
  open: boolean;
  booking: Booking | null;
  tours: Tour[];
  onClose: () => void;
  onSaved?: () => void | Promise<void>;
}

const BookingDetailsDialog: React.FC<Props> = ({ open, booking, tours, onClose, onSaved }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    tour_id: null as number | null,
    status: 'pending' as Booking['status'],
    full_name: '' as string,
    note: '' as string,
    document: '' as string,
    phone: '' as string,
    nationality: '' as string,
    number_of_people: '' as string,
    applied_price: '' as string,
    departure_date: '' as string, // YYYY-MM-DD
  });

  useEffect(() => {
    if (!booking) return;
    setIsEditing(false);
    setFormData({
      tour_id: booking.tour_id ?? null,
      status: booking.status,
      full_name: booking.full_name || '',
      note: booking.note || '',
      document: booking.document || '',
      phone: booking.phone || '',
      nationality: booking.nationality || '',
      number_of_people: booking.number_of_people != null ? String(booking.number_of_people) : '',
      applied_price: booking.applied_price != null ? String(booking.applied_price) : '',
      departure_date: booking.departure_date ? booking.departure_date.slice(0, 10) : '',
    });
  }, [booking]);

  const getTourName = useMemo(() => {
    return (tourId: number | null) => {
      if (tourId == null) return 'Unpaired';
      const t = tours.find(tt => tt.id === tourId);
      return t ? t.name : `Tour #${tourId}`;
    };
  }, [tours]);

  const handleSave = async () => {
    if (!booking) return;
    setSaving(true);
    try {
      const payload: any = {
        id: booking.id,
        status: formData.status,
        full_name: formData.full_name,
        note: formData.note,
        document: formData.document,
        phone: formData.phone,
        nationality: formData.nationality,
      };
      if (formData.applied_price !== '') {
        const price = Number(formData.applied_price);
        if (!Number.isNaN(price)) payload.applied_price = price;
      }
      if (formData.number_of_people !== '') {
        const num = Number(formData.number_of_people);
        if (!Number.isNaN(num) && num > 0) payload.number_of_people = num;
      }
      if (formData.departure_date) {
        payload.departure_date = formData.departure_date; // already YYYY-MM-DD
      }
      if (formData.tour_id != null) {
        payload.tour_id = formData.tour_id;
      }
      await updateBooking(payload);
      if (onSaved) await onSaved();
      setIsEditing(false);
      onClose();
    } catch (e) {
      // Optionally add error toast via parent
      console.error('Failed to update booking', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Booking Details</DialogTitle>
      <DialogContent>
        {booking && !isEditing && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6">{booking.full_name}</Typography>
              <Typography variant="body2" color="text.secondary">Tour: {getTourName(booking.tour_id)}</Typography>
              <Typography variant="body2" color="text.secondary">People: {booking.number_of_people}</Typography>
              <Typography variant="body2" color="text.secondary">Departure: {booking.departure_date}</Typography>
              <Typography variant="body2" color="text.secondary">Price: ${booking.applied_price}</Typography>
              <Typography variant="body2" color="text.secondary">Status: {booking.status}</Typography>
              <Typography variant="body2" color="text.secondary">Document: {booking.document || '-'}</Typography>
              <Typography variant="body2" color="text.secondary">Phone: {booking.phone}</Typography>
              <Typography variant="body2" color="text.secondary">Nationality: {booking.nationality}</Typography>
              {booking.note && (
                <Typography variant="body2" color="text.secondary">Notes: {booking.note}</Typography>
              )}
            </Grid>
          </Grid>
        )}

        {booking && isEditing && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Tour"
                value={formData.tour_id ?? ''}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setFormData({ ...formData, tour_id: val === '' ? null : Number(val) });
                }}
              >
                <MenuItem value="">Unpaired</MenuItem>
                {tours.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Departure Date"
                InputLabelProps={{ shrink: true }}
                value={formData.departure_date}
                onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Applied Price"
                type="number"
                value={formData.applied_price}
                onChange={(e) => setFormData({ ...formData, applied_price: e.target.value })}
                placeholder="Auto from tour tier or override"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
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
                <MenuItem value="unpaired">Unpaired</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Document"
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nationality"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Number of People"
                value={formData.number_of_people}
                onChange={(e) => setFormData({ ...formData, number_of_people: e.target.value })}
                inputProps={{ min: 1 }}
              />
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
        {!isEditing ? (
          <>
            <Button onClick={onClose}>Close</Button>
            <Button onClick={() => setIsEditing(true)} variant="contained">Edit</Button>
          </>
        ) : (
          <>
            <Button onClick={() => setIsEditing(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} variant="contained" disabled={saving}>Save</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BookingDetailsDialog;