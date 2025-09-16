import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
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
  Tabs,
  Tab,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { getAllTours, createTour, updateTour, deleteTour, getItineraries, createItinerary, updateItinerary, deleteItinerary } from '../services/api';

interface Tour {
  id: number;
  name: string;
  description: string;
  altitude: number;
  difficulty: number;
  distance: number;
  temperature: string;
  days: number;
  hours: number;
  price_one: number;
  price_couple: number;
  price_three_to_five: number;
  price_six_plus: number;
  images: string[];
  includes: string[];
  recommendations: string[];
  status: 'active' | 'inactive';
  created_at: string;
}

interface Activity {
  name: string;
  start_time: string;
  end_time: string;
}

interface Itinerary {
  id?: number;
  tour_id: number;
  day: number;
  activities: Activity[];
  created_at?: string;
}

const ToursPage = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tourToDelete, setTourToDelete] = useState<Tour | null>(null);
  // Details modal state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsTab, setDetailsTab] = useState(0);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [detailsForm, setDetailsForm] = useState({
    name: '',
    description: '',
    altitude: 0,
    difficulty: 1,
    distance: 0,
    temperature: '',
    days: 0,
    hours: 0,
    price_one: 0,
    price_couple: 0,
    price_three_to_five: 0,
    price_six_plus: 0,
    images: '',
    includes: '',
    recommendations: '',
    status: 'active' as 'active' | 'inactive'
  });
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [itinerariesLoading, setItinerariesLoading] = useState(false);
  const [itineraryError, setItineraryError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    altitude: 0,
    difficulty: 1,
    distance: 0,
    temperature: '',
    days: 0,
    hours: 0,
    price_one: 0,
    price_couple: 0,
    price_three_to_five: 0,
    price_six_plus: 0,
    images: '',
    includes: '',
    recommendations: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    setLoading(true);
    try {
      const data = await getAllTours();
      setTours(data);
      setError('');
    } catch (err) {
      setError('Error loading tours');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (tour?: Tour) => {
    if (tour) {
      setEditingTour(tour);
      setFormData({
        name: tour.name,
        description: tour.description,
        altitude: tour.altitude,
        difficulty: tour.difficulty,
        distance: tour.distance,
        temperature: tour.temperature,
        days: tour.days,
        hours: tour.hours,
        price_one: tour.price_one,
        price_couple: tour.price_couple,
        price_three_to_five: tour.price_three_to_five,
        price_six_plus: tour.price_six_plus,
        images: tour.images.join(', '),
        includes: tour.includes.join(', '),
        recommendations: tour.recommendations.join(', '),
        status: tour.status
      });
    } else {
      setEditingTour(null);
      setFormData({
        name: '',
        description: '',
        altitude: 0,
        difficulty: 1,
        distance: 0,
        temperature: '',
        days: 0,
        hours: 0,
        price_one: 0,
        price_couple: 0,
        price_three_to_five: 0,
        price_six_plus: 0,
        images: '',
        includes: '',
        recommendations: '',
        status: 'active'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTour(null);
  };

  const handleSubmit = async () => {
    try {
      const tourData = {
        ...formData,
        images: formData.images.split(',').map(s => s.trim()).filter(s => s),
        includes: formData.includes.split(',').map(s => s.trim()).filter(s => s),
        recommendations: formData.recommendations.split(',').map(s => s.trim()).filter(s => s)
      };

      if (editingTour) {
        await updateTour({ ...tourData, id: editingTour.id });
      } else {
        await createTour(tourData);
      }

      handleCloseDialog();
      loadTours();
    } catch (err) {
      setError('Error saving tour');
    }
  };

  const handleDelete = async () => {
    if (!tourToDelete) return;
    try {
      setLoading(true);
      await deleteTour(tourToDelete.id);
      setDeleteConfirmOpen(false);
      setTourToDelete(null);
      await loadTours();
    } catch (err) {
      setError('Error deleting tour');
    } finally {
      setLoading(false);
    }
  };

  // Details modal logic
  const handleOpenDetails = async (tour: Tour) => {
    setSelectedTour(tour);
    setDetailsForm({
      name: tour.name,
      description: tour.description,
      altitude: tour.altitude,
      difficulty: tour.difficulty,
      distance: tour.distance,
      temperature: tour.temperature,
      days: tour.days,
      hours: tour.hours,
      price_one: tour.price_one,
      price_couple: tour.price_couple,
      price_three_to_five: tour.price_three_to_five,
      price_six_plus: tour.price_six_plus,
      images: tour.images.join(', '),
      includes: tour.includes.join(', '),
      recommendations: tour.recommendations.join(', '),
      status: tour.status
    });
    setDetailsTab(0);
    setDetailsOpen(true);
    await loadItinerariesForTour(tour.id);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedTour(null);
    setItineraries([]);
    setItineraryError('');
  };

  const loadItinerariesForTour = async (tourId: number) => {
    setItinerariesLoading(true);
    setItineraryError('');
    try {
      const data = await getItineraries({ tour_id: tourId });
      setItineraries(Array.isArray(data) ? data : []);
    } catch (err) {
      setItineraryError('Error loading itineraries');
    } finally {
      setItinerariesLoading(false);
    }
  };

  const handleUpdateTourInfo = async () => {
    if (!selectedTour) return;
    try {
      const tourData = {
        ...detailsForm,
        images: detailsForm.images.split(',').map(s => s.trim()).filter(s => s),
        includes: detailsForm.includes.split(',').map(s => s.trim()).filter(s => s),
        recommendations: detailsForm.recommendations.split(',').map(s => s.trim()).filter(s => s)
      } as any;
      await updateTour({ ...tourData, id: selectedTour.id });
      await loadTours();
    } catch (err) {
      setError('Error updating tour');
    }
  };

  // Itinerary helpers
  const updateItineraryField = (index: number, field: 'day', value: number) => {
    setItineraries(prev => prev.map((it, i) => i === index ? { ...it, [field]: value } : it));
  };

  const updateActivityField = (itIndex: number, actIndex: number, field: keyof Activity, value: string) => {
    setItineraries(prev => prev.map((it, i) => {
      if (i !== itIndex) return it;
      const activities = it.activities.map((a, ai) => ai === actIndex ? { ...a, [field]: value } as Activity : a);
      return { ...it, activities };
    }));
  };

  const addActivity = (itIndex: number) => {
    setItineraries(prev => prev.map((it, i) => {
      if (i !== itIndex) return it;
      return { ...it, activities: [...it.activities, { name: '', start_time: '', end_time: '' }] };
    }));
  };

  const removeActivity = (itIndex: number, actIndex: number) => {
    setItineraries(prev => prev.map((it, i) => {
      if (i !== itIndex) return it;
      const activities = it.activities.filter((_, ai) => ai !== actIndex);
      return { ...it, activities };
    }));
  };

  const addNewItineraryDay = () => {
    if (!selectedTour) return;
    const nextDay = itineraries.length > 0 ? Math.max(...itineraries.map(i => i.day)) + 1 : 1;
    setItineraries(prev => [
      ...prev,
      { tour_id: selectedTour.id, day: nextDay, activities: [{ name: '', start_time: '', end_time: '' }] }
    ]);
  };

  const deleteItineraryEntry = async (index: number) => {
    const it = itineraries[index];
    if (it.id) {
      try {
        await deleteItinerary(it.id);
        const tourId = it.tour_id;
        await loadItinerariesForTour(tourId);
      } catch (err) {
        setItineraryError('Error deleting itinerary');
      }
    } else {
      setItineraries(prev => prev.filter((_, i) => i !== index));
    }
  };

  const saveItinerary = async (index: number) => {
    const it = itineraries[index];
    try {
      if (it.id) {
        await updateItinerary({ id: it.id, day: it.day, activities: it.activities });
      } else {
        await createItinerary({ tour_id: it.tour_id, day: it.day, activities: it.activities });
      }
      await loadItinerariesForTour(it.tour_id);
    } catch (err) {
      setItineraryError('Error saving itinerary');
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Tours Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New Tour
          </Button>
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
                  <TableCell>Name</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Distance</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Price (1p)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tours.map((tour) => (
                  <TableRow key={tour.id} hover onClick={() => handleOpenDetails(tour)} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{tour.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {tour.description.substring(0, 50)}...
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{tour.difficulty}/5</TableCell>
                    <TableCell>{tour.distance} km</TableCell>
                    <TableCell>
                      {tour.days > 0 && `${tour.days} days`}
                      {tour.hours > 0 && ` ${tour.hours} hours`}
                    </TableCell>
                    <TableCell>${tour.price_one}</TableCell>
                    <TableCell>
                      <Chip
                        label={tour.status}
                        color={tour.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => { e.stopPropagation(); handleOpenDialog(tour); }} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setTourToDelete(tour);
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

      {/* Tour Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingTour ? 'Edit Tour' : 'Create New Tour'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Temperature"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Altitude (m)"
                value={formData.altitude}
                onChange={(e) => setFormData({ ...formData, altitude: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Difficulty (1-5)"
                inputProps={{ min: 1, max: 5 }}
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) || 1 })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Distance (km)"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Days"
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Hours"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Price (1 person)"
                value={formData.price_one}
                onChange={(e) => setFormData({ ...formData, price_one: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Price (2 people)"
                value={formData.price_couple}
                onChange={(e) => setFormData({ ...formData, price_couple: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Price (3-5 people)"
                value={formData.price_three_to_five}
                onChange={(e) => setFormData({ ...formData, price_three_to_five: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Price (6+ people)"
                value={formData.price_six_plus}
                onChange={(e) => setFormData({ ...formData, price_six_plus: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Images (comma-separated URLs)"
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Includes (comma-separated)"
                value={formData.includes}
                onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                placeholder="Transportation, Guide, Equipment"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Recommendations (comma-separated)"
                value={formData.recommendations}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                placeholder="Bring warm clothes, Good physical condition"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTour ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="lg" fullWidth>
        <DialogTitle>Tour Details {selectedTour ? `- ${selectedTour.name}` : ''}</DialogTitle>
        <DialogContent dividers>
          <Tabs value={detailsTab} onChange={(e, v) => setDetailsTab(v)} sx={{ mb: 2 }}>
            <Tab label="Info" />
            <Tab label="Itinerary" />
          </Tabs>

          {detailsTab === 0 && (
            <Box>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={detailsForm.name}
                    onChange={(e) => setDetailsForm({ ...detailsForm, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Temperature"
                    value={detailsForm.temperature}
                    onChange={(e) => setDetailsForm({ ...detailsForm, temperature: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={detailsForm.description}
                    onChange={(e) => setDetailsForm({ ...detailsForm, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Altitude (m)"
                    value={detailsForm.altitude}
                    onChange={(e) => setDetailsForm({ ...detailsForm, altitude: parseInt(e.target.value) || 0 })}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Difficulty (1-5)"
                    inputProps={{ min: 1, max: 5 }}
                    value={detailsForm.difficulty}
                    onChange={(e) => setDetailsForm({ ...detailsForm, difficulty: parseInt(e.target.value) || 1 })}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Distance (km)"
                    value={detailsForm.distance}
                    onChange={(e) => setDetailsForm({ ...detailsForm, distance: parseInt(e.target.value) || 0 })}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    value={detailsForm.status}
                    onChange={(e) => setDetailsForm({ ...detailsForm, status: e.target.value as 'active' | 'inactive' })}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Days"
                    value={detailsForm.days}
                    onChange={(e) => setDetailsForm({ ...detailsForm, days: parseInt(e.target.value) || 0 })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Hours"
                    value={detailsForm.hours}
                    onChange={(e) => setDetailsForm({ ...detailsForm, hours: parseInt(e.target.value) || 0 })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Price (1 person)"
                    value={detailsForm.price_one}
                    onChange={(e) => setDetailsForm({ ...detailsForm, price_one: parseFloat(e.target.value) || 0 })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Price (2 people)"
                    value={detailsForm.price_couple}
                    onChange={(e) => setDetailsForm({ ...detailsForm, price_couple: parseFloat(e.target.value) || 0 })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Price (3-5 people)"
                    value={detailsForm.price_three_to_five}
                    onChange={(e) => setDetailsForm({ ...detailsForm, price_three_to_five: parseFloat(e.target.value) || 0 })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Price (6+ people)"
                    value={detailsForm.price_six_plus}
                    onChange={(e) => setDetailsForm({ ...detailsForm, price_six_plus: parseFloat(e.target.value) || 0 })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Images (comma-separated URLs)"
                    value={detailsForm.images}
                    onChange={(e) => setDetailsForm({ ...detailsForm, images: e.target.value })}
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Includes (comma-separated)"
                    value={detailsForm.includes}
                    onChange={(e) => setDetailsForm({ ...detailsForm, includes: e.target.value })}
                    placeholder="Transportation, Guide, Equipment"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Recommendations (comma-separated)"
                    value={detailsForm.recommendations}
                    onChange={(e) => setDetailsForm({ ...detailsForm, recommendations: e.target.value })}
                    placeholder="Bring warm clothes, Good physical condition"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {detailsTab === 1 && (
            <Box>
              {itinerariesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box>
                  {itineraryError && <Alert severity="error" sx={{ mb: 2 }}>{itineraryError}</Alert>}
                  <Button variant="outlined" onClick={addNewItineraryDay} sx={{ mb: 2 }}>Add Day</Button>
                  {itineraries.map((it, idx) => (
                    <Paper key={idx} sx={{ p: 2, mb: 2 }} variant="outlined">
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Day"
                            value={it.day}
                            onChange={(e) => updateItineraryField(idx, 'day', parseInt(e.target.value) || 1)}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>Activities</Typography>
                          {it.activities.map((act, aIdx) => (
                            <Grid container spacing={1} key={aIdx} sx={{ mb: 1 }}>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Name"
                                  value={act.name}
                                  onChange={(e) => updateActivityField(idx, aIdx, 'name', e.target.value)}
                                />
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <TextField
                                  fullWidth
                                  label="Start"
                                  placeholder="08:00"
                                  value={act.start_time}
                                  onChange={(e) => updateActivityField(idx, aIdx, 'start_time', e.target.value)}
                                />
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <TextField
                                  fullWidth
                                  label="End"
                                  placeholder="12:00"
                                  value={act.end_time}
                                  onChange={(e) => updateActivityField(idx, aIdx, 'end_time', e.target.value)}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <Button size="small" color="error" onClick={() => removeActivity(idx, aIdx)}>Remove Activity</Button>
                              </Grid>
                            </Grid>
                          ))}
                          <Button size="small" onClick={() => addActivity(idx)}>Add Activity</Button>
                        </Grid>
                        <Grid item xs={12} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button color="error" onClick={() => deleteItineraryEntry(idx)}>{it.id ? 'Delete Day' : 'Remove Day'}</Button>
                          <Button variant="contained" onClick={() => saveItinerary(idx)}>{it.id ? 'Save Changes' : 'Create Day'}</Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {detailsTab === 0 ? (
            <>
              <Button onClick={handleCloseDetails}>Close</Button>
              <Button variant="contained" onClick={handleUpdateTourInfo}>Save</Button>
            </>
          ) : (
            <Button onClick={handleCloseDetails}>Close</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{tourToDelete?.name}"? This action cannot be undone. Bookings attached to this tour will be marked as "unpaired" so they can be reassigned later.
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

export default ToursPage;