const BASE_URL = 'http://10.77.179.139:3001/api';

class ApiService {
  constructor() {
    this.baseURL = BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      ...options,
    };

    try {
      console.log(`API Request: ${url}`); // Debug log
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error Response (${response.status}):`, errorText);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log(`API Success (${endpoint}):`, data.success ? 'OK' : 'Failed'); // Debug log
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`API Error (${endpoint}):`, error.message);
      
      // Provide more specific error messages
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      } else if (error.message.includes('Network request failed')) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  // Bus-related API calls
  async getAllBuses() {
    return this.request('/buses');
  }

  async getBusesByRoute(routeId) {
    return this.request(`/buses/route/${routeId}`);
  }

  async getNearbyBuses(latitude, longitude, radius = 5000) {
    return this.request(`/buses/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
  }

  async getBus(busId) {
    return this.request(`/buses/${busId}`);
  }

  async updateBusLocation(busId, locationData) {
    return this.request(`/buses/${busId}/location`, {
      method: 'PUT',
      body: JSON.stringify(locationData),
    });
  }

  // Bus stop-related API calls
  async getAllBusStops(page = 1, limit = 50, search = '') {
    let endpoint = `/bus-stops?page=${page}&limit=${limit}`;
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }
    return this.request(endpoint);
  }

  async getNearbyBusStops(latitude, longitude, radius = 2000) {
    return this.request(`/bus-stops/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
  }

  async getBusStop(stopId) {
    return this.request(`/bus-stops/${stopId}`);
  }

  async getBusStopsByRoute(routeId) {
    return this.request(`/bus-stops/route/${routeId}`);
  }

  async searchBusStops(query, latitude = null, longitude = null, radius = 5000) {
    let endpoint = `/bus-stops/search?q=${encodeURIComponent(query)}`;
    if (latitude && longitude) {
      endpoint += `&latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
    }
    return this.request(endpoint);
  }

  // Route-related API calls
  async getAllRoutes(page = 1, limit = 20, search = '', busType = '') {
    let endpoint = `/routes?page=${page}&limit=${limit}`;
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }
    if (busType) {
      endpoint += `&busType=${busType}`;
    }
    return this.request(endpoint);
  }

  async getRoute(routeId) {
    return this.request(`/routes/${routeId}`);
  }

  async planJourney(from, to, busType = '') {
    let endpoint = `/routes/plan-journey?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    if (busType) {
      endpoint += `&busType=${busType}`;
    }
    return this.request(endpoint);
  }

  async calculateFare(fromStop, toStop, routeId = '', busType = 'ordinary') {
    let endpoint = `/routes/calculate-fare?fromStop=${encodeURIComponent(fromStop)}&toStop=${encodeURIComponent(toStop)}&busType=${busType}`;
    if (routeId) {
      endpoint += `&routeId=${routeId}`;
    }
    return this.request(endpoint);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();
