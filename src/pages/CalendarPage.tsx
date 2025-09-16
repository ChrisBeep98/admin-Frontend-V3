import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Grid,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { getAllBookings, updateBooking, getAllTours } from '../services/api';
import BookingDetailsDialog from '../components/BookingDetailsDialog';

interface Booking {
  id: number;
  tour_id: number | null;
  full_name: string;
  phone: string;
  nationality: string;
  note?: string;
  number_of_people: number;
  departure_date: string; // ISO date
  applied_price: number;
  status: 'pending' | 'confirmed' | 'canceled' | 'unpaired';
}

interface Tour { id: number; name: string; }

const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const firstDayOfWeek = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0=Sun

const CalendarPage: React.FC = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [hoverDay, setHoverDay] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    (async () => {
      try {
        const [b, t] = await Promise.all([
          getAllBookings(),
          getAllTours()
        ]);
        setBookings(b);
        setTours(t);
      } catch (e) {
        console.error('Failed loading calendar data', e);
      }
    })();
  }, [year, month]);

  const days = useMemo(() => {
    const total = daysInMonth(year, month);
    const first = firstDayOfWeek(year, month);
    const cells: (number | null)[] = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const bookingsByDay = useMemo(() => {
    const map = new Map<number, Booking[]>();
    for (const b of bookings) {
      // Avoid timezone shifts: parse as YYYY-MM-DD parts
      const [yyyy, mm, dd] = b.departure_date.split('-').map(Number);
      if (!yyyy || !mm || !dd) continue;
      const d = { y: yyyy, m: mm - 1, day: dd };
      if (d.y === year && d.m === month) {
        const arr = map.get(d.day) || [];
        arr.push(b);
        map.set(d.day, arr);
      }
    }
    return map;
  }, [bookings, year, month]);

  const changeMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m);
    setYear(y);
  };

  const getTourName = (tourId: number | null) => {
    if (tourId == null) return 'Unpaired';
    const t = tours.find(tt => tt.id === tourId);
    return t ? t.name : `Tour #${tourId}`;
  };

  const refreshBookings = async () => {
    try {
      const b = await getAllBookings();
      setBookings(b);
    } catch (e) {
      console.error('Failed reloading bookings', e);
    }
  };

  const updateSelectedBookingStatus = async (status: Booking['status']) => {
    if (!selectedBooking) return;
    try {
      await updateBooking({ id: selectedBooking.id, status });
      await refreshBookings();
      setToast({ open: true, message: 'Booking updated', severity: 'success' });
    } catch {
      setToast({ open: true, message: 'Update failed', severity: 'error' });
    }
  };

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const weekNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // When returning to this page, reload data to avoid stale bookings
  useEffect(() => {
    const handleFocus = () => {
      getAllBookings().then(setBookings).catch(() => {});
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Bookings Calendar</Typography>
          <Box>
            <IconButton onClick={() => changeMonth(-1)}><ChevronLeft /></IconButton>
            <Typography component="span" variant="h6" sx={{ mx: 2 }}>{monthNames[month]} {year}</Typography>
            <IconButton onClick={() => changeMonth(1)}><ChevronRight /></IconButton>
          </Box>
        </Box>

        <Grid container spacing={1} sx={{ mb: 1 }}>
          {weekNames.map((w) => (
            <Grid key={w} item xs={12/7 as any}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>{w}</Typography>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={1}>
          {days.map((d, idx) => {
            const dayBookings = d ? (bookingsByDay.get(d) || []) : [];
            const kpi = dayBookings.length;
            return (
              <Grid key={idx} item xs={12/7 as any}>
                <Paper
                  variant="outlined"
                  sx={{ p: 1, height: 90, position: 'relative' }}
                  onMouseEnter={() => d && setHoverDay(d)}
                  onMouseLeave={() => setHoverDay(null)}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>{d || ''}</Typography>
                  {kpi > 0 && (
                    <Chip size="small" color="primary" label={`${kpi} booking${kpi>1?'s':''}`} sx={{ position: 'absolute', top: 6, right: 6 }} />
                  )}

                  {hoverDay === d && d && dayBookings.length > 0 && (
                    <Paper elevation={3} sx={{ position: 'absolute', zIndex: 2, top: 24, left: 0, right: 0, p: 1, maxHeight: 200, overflow: 'auto' }}>
                      {dayBookings.map(b => (
                        <Tooltip key={b.id} title={`People: ${b.number_of_people} | Status: ${b.status}`} placement="right">
                          <Box sx={{ py: 0.5, px: 0.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => setSelectedBooking(b)}>
                            <Typography variant="body2">{b.full_name} • {getTourName(b.tour_id)}</Typography>
                          </Box>
                        </Tooltip>
                      ))}
                    </Paper>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        <BookingDetailsDialog
          open={!!selectedBooking}
          booking={selectedBooking}
          tours={tours}
          onClose={() => setSelectedBooking(null)}
          onSaved={refreshBookings}
        />

        <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={() => setToast(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setToast(prev => ({ ...prev, open: false }))} severity={toast.severity} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default CalendarPage;