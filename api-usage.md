# Nevado Trek API - Complete Usage Guide

This comprehensive guide explains how to use all endpoints of the Nevado Trek API, including request formats, required fields, and response examples.

## 📋 Table of Contents

- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Tour Endpoints](#tour-endpoints)
- [Itinerary Endpoints](#itinerary-endpoints)
- [Booking Endpoints](#booking-endpoints)
- [Error Handling](#error-handling)
- [Code Examples](#code-examples)

---

## API Overview

### Base URL
```
https://donprqhxuezsyokucfht.supabase.co/functions/v1/nevado-trek-api
```

### Request Format
All requests are **POST** requests with JSON body:
```json
{
  "action": "endpoint_name",
  "data": {
    // endpoint-specific data
  }
}
```

### Response Format
All responses are JSON with consistent structure:
```json
// Success responses
{
  "message": "Operation completed successfully"
}

// Data responses
[
  {
    // data objects
  }
]

// Error responses
{
  "error": "Error description"
}
```

---

## Authentication

### Admin Token
Protected endpoints require Bearer token authentication:
```

```

### Endpoint Types
- 🔒 **Protected**: Require admin token
- 🌐 **Public**: No authentication needed

---

## Tour Endpoints

### 🔒 Get All Tours
**Action**: `get_all_tours`  
**Description**: Retrieve all tours (including inactive ones)

#### Request
```json
{
  "action": "get_all_tours"
}
```

#### Response
```json
[
  {
    "id": 1,
    "name": "Nevado Huascarán Circuit - 5 Days",
    "description": "Experience Peru's highest peak...",
    "altitude": 6768,
    "difficulty": 5,
    "distance": 45,
    "temperature": "Very Cold",
    "days": 5,
    "hours": 0,
    "price_one": 450.00,
    "price_couple": 800.00,
    "price_three_to_five": 1200.00,
    "price_six_plus": 1500.00,
    "images": ["url1", "url2"],
    "includes": ["Guide", "Equipment"],
    "recommendations": ["Experience required"],
    "created_by": "superadmin",
    "created_at": "2025-01-15T10:30:00Z",
    "status": "active"
  }
]
```

### 🔒 Create Tour
**Action**: `create_tour`  
**Description**: Create a new tour

#### Required Fields
- `name` (string): Tour name
- `description` (string): Tour description
- `altitude` (integer): Altitude in meters
- `difficulty` (integer): 1-5 scale
- `distance` (integer): Distance in kilometers
- `temperature` (string): Temperature description
- `days` (integer): Duration in days (0 if not applicable)
- `hours` (integer): Duration in hours (0 if not applicable)
- `price_one` (decimal): Price for 1 person
- `price_couple` (decimal): Price for 2 people
- `price_three_to_five` (decimal): Price for 3-5 people
- `price_six_plus` (decimal): Price for 6+ people
- `images` (array): Array of image URLs
- `includes` (array): Array of included items
- `recommendations` (array): Array of recommendations
- `status` (string): "active" or "inactive"

#### Request
```json
{
  "action": "create_tour",
  "data": {
    "name": "Mountain Adventure",
    "description": "An exciting mountain trek through scenic landscapes",
    "altitude": 4200,
    "difficulty": 4,
    "distance": 25,
    "temperature": "Cold",
    "days": 3,
    "hours": 0,
    "price_one": 200.00,
    "price_couple": 350.00,
    "price_three_to_five": 500.00,
    "price_six_plus": 600.00,
    "images": [
      "https://example.com/mountain1.jpg",
      "https://example.com/mountain2.jpg"
    ],
    "includes": [
      "Professional guide",
      "Camping equipment",
      "All meals"
    ],
    "recommendations": [
      "Good physical condition",
      "Warm clothing",
      "Hiking boots"
    ],
    "status": "active"
  }
}
```

#### Response
```json
{
  "message": "Tour created successfully"
}
```

### 🔒 Update Tour
**Action**: `update_tour`  
**Description**: Update an existing tour (partial updates allowed)

#### Required Fields
- `id` (integer): Tour ID to update

#### Request
```json
{
  "action": "update_tour",
  "data": {
    "id": 1,
    "description": "Updated tour description",
    "price_one": 250.00,
    "status": "inactive"
  }
}
```

#### Response
```json
{
  "message": "Tour updated successfully"
}
```

### 🔒 Delete Tour
**Action**: `delete_tour`  
**Description**: Delete a tour by ID

#### Required Fields
- `id` (integer): Tour ID to delete

#### Request
```json
{
  "action": "delete_tour",
  "data": {
    "id": 1
  }
}
```

#### Response
```json
{
  "message": "Tour deleted successfully"
}
```

---

## Itinerary Endpoints

### 🔒 Get Itineraries
**Action**: `get_itineraries`  
**Description**: Retrieve itineraries with optional filtering

#### Optional Fields
- `tour_id` (integer): Filter by tour ID
- `id` (integer): Get specific itinerary by ID

#### Request
```json
{
  "action": "get_itineraries",
  "data": {
    "tour_id": 1
  }
}
```

#### Response
```json
[
  {
    "id": 1,
    "tour_id": 1,
    "day": 1,
    "activities": [
      {
        "name": "Equipment Check & Briefing",
        "start_time": "08:00",
        "end_time": "10:00"
      },
      {
        "name": "Drive to Base Camp",
        "start_time": "10:00",
        "end_time": "14:00"
      }
    ],
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

### 🔒 Create Itinerary
**Action**: `create_itinerary`  
**Description**: Create a new itinerary for a tour

#### Required Fields
- `tour_id` (integer): ID of the tour
- `day` (integer): Day number (≥1)
- `activities` (array): Array of activity objects

#### Activity Object Structure
- `name` (string): Activity name
- `start_time` (string): Start time in HH:MM format
- `end_time` (string): End time in HH:MM format

#### Request
```json
{
  "action": "create_itinerary",
  "data": {
    "tour_id": 1,
    "day": 1,
    "activities": [
      {
        "name": "Morning Hike",
        "start_time": "08:00",
        "end_time": "12:00"
      },
      {
        "name": "Lunch Break",
        "start_time": "12:00",
        "end_time": "13:00"
      },
      {
        "name": "Afternoon Exploration",
        "start_time": "13:00",
        "end_time": "17:00"
      }
    ]
  }
}
```

#### Response
```json
{
  "message": "Itinerary created successfully"
}
```

### 🔒 Update Itinerary
**Action**: `update_itinerary`  
**Description**: Update an existing itinerary

#### Required Fields
- `id` (integer): Itinerary ID to update

#### Optional Fields
- `day` (integer): Update day number
- `activities` (array): Replace entire activities array

#### Request
```json
{
  "action": "update_itinerary",
  "data": {
    "id": 1,
    "activities": [
      {
        "name": "Updated Morning Hike",
        "start_time": "07:30",
        "end_time": "11:30"
      },
      {
        "name": "Extended Lunch",
        "start_time": "11:30",
        "end_time": "13:30"
      }
    ]
  }
}
```

#### Response
```json
{
  "message": "Itinerary updated successfully"
}
```

### 🔒 Delete Itinerary
**Action**: `delete_itinerary`  
**Description**: Delete an itinerary by ID

#### Required Fields
- `id` (integer): Itinerary ID to delete

#### Request
```json
{
  "action": "delete_itinerary",
  "data": {
    "id": 1
  }
}
```

#### Response
```json
{
  "message": "Itinerary deleted successfully"
}
```

---

## Booking Endpoints

### 🌐 Create Booking (Public)
**Action**: `create_booking`  
**Description**: Create a new booking (no authentication required)

#### Required Fields
- `tour_id` (integer): ID of the tour to book
- `full_name` (string): Customer's full name
- `phone` (string): Phone number with country code
- `nationality` (string): Customer's nationality
- `number_of_people` (integer): Number of people (≥1)
- `departure_date` (string): Departure date in YYYY-MM-DD format

#### Optional Fields
- `document` (string): ID or passport number
- `note` (string): Additional notes (max 500 characters)

#### Pricing Logic
The system automatically calculates `applied_price` based on `number_of_people`:
- 1 person → `price_one`
- 2 people → `price_couple`
- 3-5 people → `price_three_to_five`
- 6+ people → `price_six_plus`

#### Request
```json
{
  "action": "create_booking",
  "data": {
    "tour_id": 1,
    "full_name": "John Doe",
    "document": "12345678",
    "phone": "+1234567890",
    "nationality": "American",
    "note": "First time trekking, excited for the adventure!",
    "number_of_people": 2,
    "departure_date": "2025-10-20"
  }
}
```

#### Response
```json
{
  "message": "Booking created successfully"
}
```

### 🔒 Get Bookings
**Action**: `get_bookings`  
**Description**: Retrieve bookings with optional filtering

#### Optional Fields
- `tour_id` (integer): Filter by tour ID
- `status` (string): Filter by status ("pending", "confirmed", "canceled")

#### Request
```json
{
  "action": "get_bookings",
  "data": {
    "tour_id": 1,
    "status": "confirmed"
  }
}
```

#### Response
```json
[
  {
    "id": 1,
    "tour_id": 1,
    "full_name": "John Doe",
    "document": "12345678",
    "phone": "+1234567890",
    "nationality": "American",
    "note": "First time trekking, excited for the adventure!",
    "number_of_people": 2,
    "departure_date": "2025-10-20",
    "applied_price": 800.00,
    "status": "confirmed",
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

### 🔒 Update Booking
**Action**: `update_booking`  
**Description**: Update an existing booking

#### Required Fields
- `id` (integer): Booking ID to update

#### Common Update Fields
- `status` (string): "pending", "confirmed", or "canceled"
- `full_name` (string): Update customer name
- `phone` (string): Update phone number
- `departure_date` (string): Update departure date

#### Request
```json
{
  "action": "update_booking",
  "data": {
    "id": 1,
    "status": "confirmed",
    "note": "Confirmed booking - payment received"
  }
}
```

#### Response
```json
{
  "message": "Booking updated successfully"
}
```

### 🔒 Delete Booking
**Action**: `delete_booking`  
**Description**: Delete a booking by ID

#### Required Fields
- `id` (integer): Booking ID to delete

#### Request
```json
{
  "action": "delete_booking",
  "data": {
    "id": 1
  }
}
```

#### Response
```json
{
  "message": "Booking deleted successfully"
}
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Unsupported action"
}
```

#### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

#### 404 Not Found
```json
{
  "error": "Tour not found"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

### Validation Errors

#### Missing Required Fields
```json
{
  "error": "tour_id and number_of_people are required"
}
```

#### Database Constraint Violations
```json
{
  "error": "duplicate key value violates unique constraint"
}
```

---

## Code Examples

### JavaScript/Node.js
```javascript
const baseUrl = 'https://donprqhxuezsyokucfht.supabase.co/functions/v1/nevado-trek-api';
const adminToken = 'only the creator has acces to the token';

// Create a tour
async function createTour(tourData) {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'create_tour',
      data: tourData
    })
  });
  
  return await response.json();
}

// Create a booking (public)
async function createBooking(bookingData) {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'create_booking',
      data: bookingData
    })
  });
  
  return await response.json();
}
```

### Python
```python
import requests
import json

BASE_URL = 'https://donprqhxuezsyokucfht.supabase.co/functions/v1/nevado-trek-api'
ADMIN_TOKEN = 'only the creator has acces to the token'

def create_tour(tour_data):
    headers = {
        'Authorization': f'Bearer {ADMIN_TOKEN}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'action': 'create_tour',
        'data': tour_data
    }
    
    response = requests.post(BASE_URL, headers=headers, json=payload)
    return response.json()

def create_booking(booking_data):
    headers = {
        'Content-Type': 'application/json'
    }
    
    payload = {
        'action': 'create_booking',
        'data': booking_data
    }
    
    response = requests.post(BASE_URL, headers=headers, json=payload)
    return response.json()
```

### PowerShell
```powershell
$baseUrl = 'https://donprqhxuezsyokucfht.supabase.co/functions/v1/nevado-trek-api'
$adminToken = 'only the creator has acces to the token'

# Admin headers
$adminHeaders = @{
    'Authorization' = "Bearer $adminToken"
    'Content-Type' = 'application/json'
}

# Public headers
$publicHeaders = @{
    'Content-Type' = 'application/json'
}

# Create tour
$tourData = @{
    action = 'create_tour'
    data = @{
        name = 'Test Tour'
        description = 'A test tour'
        # ... other fields
    }
}

$body = $tourData | ConvertTo-Json -Depth 10
$result = Invoke-RestMethod -Uri $baseUrl -Method Post -Headers $adminHeaders -Body $body
```

### cURL
```bash
# Create tour (admin)
curl -X POST "https://donprqhxuezsyokucfht.supabase.co/functions/v1/nevado-trek-api" \
  -H "Authorization: Bearer only the creator has acces to the token" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_tour",
    "data": {
      "name": "Test Tour",
      "description": "A test tour",
      "altitude": 4000,
      "difficulty": 3,
      "distance": 20,
      "temperature": "Cold",
      "days": 2,
      "hours": 0,
      "price_one": 150.00,
      "price_couple": 280.00,
      "price_three_to_five": 400.00,
      "price_six_plus": 500.00,
      "images": ["url1"],
      "includes": ["Guide"],
      "recommendations": ["Warm clothes"],
      "status": "active"
    }
  }'

# Create booking (public)
curl -X POST "https://donprqhxuezsyokucfht.supabase.co/functions/v1/nevado-trek-api" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_booking",
    "data": {
      "tour_id": 1,
      "full_name": "John Doe",
      "phone": "+1234567890",
      "nationality": "American",
      "number_of_people": 2,
      "departure_date": "2025-10-20"
    }
  }'
```

---

## Best Practices

### 1. Error Handling
Always check response status and handle errors appropriately:
```javascript
const response = await fetch(baseUrl, options);
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.error || 'Request failed');
}
```

### 2. Input Validation
Validate data before sending requests:
- Check required fields are present
- Validate data types and formats
- Ensure arrays are properly structured

### 3. Rate Limiting
Implement appropriate delays between requests to avoid overwhelming the API.

### 4. Security
- Never expose admin tokens in client-side code
- Use environment variables for sensitive data
- Implement proper authentication in your application

### 5. Data Consistency
- Use transactions for related operations
- Verify data integrity after operations
- Handle partial failures gracefully

---

## Support

For technical support or questions about the API, please refer to the project documentation or contact the development team.

**API Version**: 1.0  
**Last Updated**: January 2025