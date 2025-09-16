const API_URL = 'https://donprqhxuezsyokucfht.supabase.co/functions/v1/nevado-trek-api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Helper function to make API calls
const apiCall = async (action: string, data?: any) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, data }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${action}:`, error);
    throw error;
  }
};

// Authentication
export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'get_all_tours' }),
    });

    return response.ok;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

// Tours API
export const getAllTours = async () => {
  return await apiCall('get_all_tours');
};

export const createTour = async (tourData: any) => {
  return await apiCall('create_tour', tourData);
};

export const updateTour = async (tourData: any) => {
  return await apiCall('update_tour', tourData);
};

export const deleteTour = async (tourId: number) => {
  return await apiCall('delete_tour', { id: tourId });
};

// Bookings API
export const getAllBookings = async (filters?: any) => {
  return await apiCall('get_bookings', filters);
};

export const updateBooking = async (bookingData: any) => {
  return await apiCall('update_booking', bookingData);
};

export const deleteBooking = async (bookingId: number) => {
  return await apiCall('delete_booking', { id: bookingId });
};

// Itineraries API
export const getItineraries = async (filters?: any) => {
  return await apiCall('get_itineraries', filters);
};

export const createItinerary = async (itineraryData: any) => {
  return await apiCall('create_itinerary', itineraryData);
};

export const updateItinerary = async (itineraryData: any) => {
  return await apiCall('update_itinerary', itineraryData);
};

export const deleteItinerary = async (itineraryId: number) => {
  return await apiCall('delete_itinerary', { id: itineraryId });
};
