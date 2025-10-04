import { getStoredCredentials } from '../context/AuthContext';

// Base URL for analytics API
const ANALYTICS_API_BASE = 'http://localhost:8080/api/analytics';

// Helper function to create Basic Auth headers
const createAuthHeaders = () => {
  const credentials = getStoredCredentials();
  if (!credentials) {
    throw new Error('No authentication credentials found');
  }
  
  const encoded = btoa(`${credentials.username}:${credentials.password}`);
  return {
    'Authorization': `Basic ${encoded}`,
    'Content-Type': 'application/json'
  };
};

// Helper function to format currency
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Helper function to format percentage
export const formatPercentage = (value) => {
  if (value === null || value === undefined) return '0.00%';
  return `${value.toFixed(2)}%`;
};

// Helper function to format large numbers
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Helper function to format dates
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

// Helper function to get trend direction
export const getTrendDirection = (changePercent) => {
  if (changePercent > 0) return 'up';
  if (changePercent < 0) return 'down';
  return 'neutral';
};

// Helper function to get trend color
export const getTrendColor = (changePercent) => {
  if (changePercent > 0) return 'text-green-600';
  if (changePercent < 0) return 'text-red-600';
  return 'text-gray-600';
};

// Helper function to get performance indicator
export const getPerformanceIndicator = (ctr) => {
  if (ctr >= 3.0) return { label: 'Excellent', color: 'bg-green-500' };
  if (ctr >= 2.0) return { label: 'Good', color: 'bg-blue-500' };
  if (ctr >= 1.0) return { label: 'Average', color: 'bg-yellow-500' };
  if (ctr > 0) return { label: 'Poor', color: 'bg-red-500' };
  return { label: 'No Data', color: 'bg-gray-500' };
};

// Analytics Service Class
class AnalyticsService {
  
  // Track Event (Public endpoint - no auth required)
  static async trackEvent(eventData) {
    try {
      const response = await fetch(`${ANALYTICS_API_BASE}/track-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to track event: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Analytics tracking error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get Dashboard Metrics (CLIENT and MARKETING_MANAGER)
  static async getDashboardMetrics() {
    try {
      const headers = createAuthHeaders();
      
      const response = await fetch(`${ANALYTICS_API_BASE}/dashboard-metrics`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch dashboard metrics: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Dashboard metrics error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get Advertisement Metrics (CLIENT and MARKETING_MANAGER)
  static async getAdvertisementMetrics(advertisementId) {
    try {
      if (!advertisementId) {
        throw new Error('Advertisement ID is required');
      }

      const headers = createAuthHeaders();
      
      const response = await fetch(`${ANALYTICS_API_BASE}/metrics/${advertisementId}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch advertisement metrics: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Advertisement metrics error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper method to track impression when ad is viewed
  static async trackImpression(advertisementId, sessionData = {}) {
    const eventData = {
      eventType: 'IMPRESSION',
      advertisementId,
      sessionId: sessionData.sessionId || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ipAddress: sessionData.ipAddress || '127.0.0.1',
      userAgent: sessionData.userAgent || navigator.userAgent,
      deviceType: sessionData.deviceType || this.getDeviceType(),
      browserType: sessionData.browserType || this.getBrowserType(),
      locationCountry: sessionData.locationCountry || 'Unknown',
      locationCity: sessionData.locationCity || 'Unknown',
      pageUrl: sessionData.pageUrl || window.location.href
    };

    return this.trackEvent(eventData);
  }

  // Helper method to track click when ad is clicked
  static async trackClick(advertisementId, sessionData = {}) {
    const eventData = {
      eventType: 'CLICK',
      advertisementId,
      sessionId: sessionData.sessionId || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ipAddress: sessionData.ipAddress || '127.0.0.1',
      userAgent: sessionData.userAgent || navigator.userAgent,
      deviceType: sessionData.deviceType || this.getDeviceType(),
      browserType: sessionData.browserType || this.getBrowserType(),
      locationCountry: sessionData.locationCountry || 'Unknown',
      locationCity: sessionData.locationCity || 'Unknown',
      pageUrl: sessionData.pageUrl || window.location.href
    };

    return this.trackEvent(eventData);
  }

  // Helper method to track view when ad is properly viewed
  static async trackView(advertisementId, sessionData = {}) {
    const eventData = {
      eventType: 'VIEW',
      advertisementId,
      sessionId: sessionData.sessionId || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ipAddress: sessionData.ipAddress || '127.0.0.1',
      userAgent: sessionData.userAgent || navigator.userAgent,
      deviceType: sessionData.deviceType || this.getDeviceType(),
      browserType: sessionData.browserType || this.getBrowserType(),
      locationCountry: sessionData.locationCountry || 'Unknown',
      locationCity: sessionData.locationCity || 'Unknown',
      pageUrl: sessionData.pageUrl || window.location.href
    };

    return this.trackEvent(eventData);
  }

  // Helper method to detect device type
  static getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
      return 'Mobile';
    }
    if (/tablet|ipad/i.test(userAgent)) {
      return 'Tablet';
    }
    return 'Desktop';
  }

  // Helper method to detect browser type
  static getBrowserType() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome')) return 'Chrome';
    if (userAgent.includes('firefox')) return 'Firefox';
    if (userAgent.includes('safari')) return 'Safari';
    if (userAgent.includes('edge')) return 'Edge';
    if (userAgent.includes('opera')) return 'Opera';
    return 'Unknown';
  }

  // Validation helper for event data
  static validateEventData(eventData) {
    const required = ['eventType', 'advertisementId', 'sessionId'];
    const missing = required.filter(field => !eventData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    const validEventTypes = ['IMPRESSION', 'CLICK', 'VIEW'];
    if (!validEventTypes.includes(eventData.eventType)) {
      throw new Error(`Invalid event type. Must be one of: ${validEventTypes.join(', ')}`);
    }

    if (!Number.isInteger(eventData.advertisementId) || eventData.advertisementId <= 0) {
      throw new Error('Advertisement ID must be a positive integer');
    }

    return true;
  }

  // Generate session ID
  static generateSessionId() {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get cached session ID or create new one
  static getSessionId() {
    const SESSION_KEY = 'adspark_session_id';
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    
    return sessionId;
  }

  // Clear session ID (for logout)
  static clearSession() {
    sessionStorage.removeItem('adspark_session_id');
  }

  // Get all metrics summary for dashboard
  static async getDashboardSummary() {
    try {
      const metricsResult = await this.getDashboardMetrics();
      
      if (!metricsResult.success) {
        throw new Error(metricsResult.error);
      }

      const data = metricsResult.data;
      
      return {
        success: true,
        data: {
          overview: {
            totalAdvertisements: data.totalAdvertisements || 0,
            totalClicks: data.totalClicks || 0,
            totalViews: data.totalViews || 0,
            totalImpressions: data.totalImpressions || 0,
            overallCTR: data.overallCTR || 0,
            overallViewRate: data.overallViewRate || 0
          },
          trends: {
            clicks: data.clickTrends || [],
            views: data.viewTrends || [],
            impressions: data.impressionTrends || []
          },
          topPerformingAds: data.topPerformingAds || [],
          recentEvents: data.recentEvents || []
        }
      };
    } catch (error) {
      console.error('Dashboard summary error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default AnalyticsService;