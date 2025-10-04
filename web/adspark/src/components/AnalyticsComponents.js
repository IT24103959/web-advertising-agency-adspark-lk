"use client";

import {
  formatNumber,
  formatPercentage,
  getTrendColor,
  getTrendDirection,
} from "../../services/analyticsService";

// Metrics Card Component
export function MetricsCard({
  title,
  value,
  change,
  icon,
  colorClass = "bg-blue-500",
}) {
  const trendDirection = getTrendDirection(change);
  const trendColor = getTrendColor(change);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClass} text-white`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {change !== null && change !== undefined && (
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${trendColor}`}
              >
                {trendDirection === "up" && (
                  <svg
                    className="h-4 w-4 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5 12l5-5 5 5H5z" />
                  </svg>
                )}
                {trendDirection === "down" && (
                  <svg
                    className="h-4 w-4 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M15 8l-5 5-5-5h10z" />
                  </svg>
                )}
                {Math.abs(change).toFixed(2)}%
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Line Chart Component
export function LineChart({ data, title, color = "blue" }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  const getColorClass = (color) => {
    const colors = {
      blue: "stroke-blue-500 fill-blue-100",
      green: "stroke-green-500 fill-green-100",
      red: "stroke-red-500 fill-red-100",
      yellow: "stroke-yellow-500 fill-yellow-100",
      purple: "stroke-purple-500 fill-purple-100",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid lines */}
          <defs>
            <pattern
              id="grid"
              width="40"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 20"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Chart area */}
          <g transform="translate(40, 20)">
            {/* Data line */}
            <path
              d={data
                .map((d, i) => {
                  const x = (i / (data.length - 1)) * 320;
                  const y = 160 - ((d.value - minValue) / range) * 140;
                  return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                })
                .join(" ")}
              className={`${getColorClass(color)} stroke-2 fill-none`}
            />

            {/* Data points */}
            {data.map((d, i) => {
              const x = (i / (data.length - 1)) * 320;
              const y = 160 - ((d.value - minValue) / range) * 140;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  className={`${
                    getColorClass(color).split(" ")[0]
                  } fill-current`}
                />
              );
            })}
          </g>

          {/* X-axis labels */}
          <g transform="translate(40, 180)">
            {data.map((d, i) => {
              const x = (i / (data.length - 1)) * 320;
              return (
                <text
                  key={i}
                  x={x}
                  y="15"
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {new Date(d.period).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </text>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>Min: {formatNumber(minValue)}</span>
        <span>Max: {formatNumber(maxValue)}</span>
      </div>
    </div>
  );
}

// Performance Indicator Component
export function PerformanceIndicator({ ctr, title }) {
  const getIndicator = (ctr) => {
    if (ctr >= 3.0)
      return { label: "Excellent", color: "bg-green-500", width: "90%" };
    if (ctr >= 2.0)
      return { label: "Good", color: "bg-blue-500", width: "70%" };
    if (ctr >= 1.0)
      return { label: "Average", color: "bg-yellow-500", width: "50%" };
    if (ctr > 0) return { label: "Poor", color: "bg-red-500", width: "30%" };
    return { label: "No Data", color: "bg-gray-500", width: "0%" };
  };

  const indicator = getIndicator(ctr);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Click-Through Rate</span>
          <span className="text-lg font-semibold text-gray-900">
            {formatPercentage(ctr)}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${indicator.color} transition-all duration-300`}
            style={{ width: indicator.width }}
          ></div>
        </div>

        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${indicator.color} text-white`}
          >
            {indicator.label}
          </span>
          <span className="text-xs text-gray-500">
            {ctr >= 3.0
              ? "Outstanding performance!"
              : ctr >= 2.0
              ? "Above average"
              : ctr >= 1.0
              ? "Industry average"
              : ctr > 0
              ? "Needs improvement"
              : "No clicks yet"}
          </span>
        </div>
      </div>
    </div>
  );
}

// Top Performing Ads Component
export function TopPerformingAds({
  ads,
  title = "Top Performing Advertisements",
}) {
  if (!ads || ads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          No performance data available yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {ads.slice(0, 5).map((ad, index) => (
          <div
            key={ad.id || index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium text-white ${
                  index === 0
                    ? "bg-yellow-500"
                    : index === 1
                    ? "bg-gray-400"
                    : index === 2
                    ? "bg-yellow-600"
                    : "bg-gray-300"
                }`}
              >
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {ad.title || `Ad #${ad.id}`}
                </p>
                <p className="text-xs text-gray-500">
                  {formatNumber(ad.impressions || 0)} impressions •{" "}
                  {formatNumber(ad.clicks || 0)} clicks
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {formatPercentage(ad.ctr || 0)}
              </p>
              <p className="text-xs text-gray-500">CTR</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Recent Events Component
export function RecentEvents({ events, title = "Recent Activity" }) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">No recent activity</div>
      </div>
    );
  }

  const getEventIcon = (eventType) => {
    const icons = {
      IMPRESSION: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path
            fillRule="evenodd"
            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
      CLICK: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      VIEW: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };
    return icons[eventType] || icons.IMPRESSION;
  };

  const getEventColor = (eventType) => {
    const colors = {
      IMPRESSION: "text-blue-500 bg-blue-100",
      CLICK: "text-green-500 bg-green-100",
      VIEW: "text-purple-500 bg-purple-100",
    };
    return colors[eventType] || colors.IMPRESSION;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {events.slice(0, 10).map((event, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
          >
            <div
              className={`p-2 rounded-full ${getEventColor(event.eventType)}`}
            >
              {getEventIcon(event.eventType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{event.eventType}</span> on Ad #
                {event.advertisementId}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {event.deviceType} • {event.browserType} •{" "}
                {event.locationCountry}
              </p>
            </div>
            <div className="text-xs text-gray-400">
              {event.timestamp
                ? new Date(event.timestamp).toLocaleTimeString()
                : "Recently"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Analytics Overview Component
export function AnalyticsOverview({ data }) {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricsCard
        title="Total Advertisements"
        value={formatNumber(data.totalAdvertisements)}
        icon={
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        }
        colorClass="bg-blue-500"
      />

      <MetricsCard
        title="Total Impressions"
        value={formatNumber(data.totalImpressions)}
        icon={
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clipRule="evenodd"
            />
          </svg>
        }
        colorClass="bg-green-500"
      />

      <MetricsCard
        title="Total Clicks"
        value={formatNumber(data.totalClicks)}
        icon={
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z"
              clipRule="evenodd"
            />
          </svg>
        }
        colorClass="bg-purple-500"
      />

      <MetricsCard
        title="Overall CTR"
        value={formatPercentage(data.overallCTR)}
        icon={
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
              clipRule="evenodd"
            />
          </svg>
        }
        colorClass="bg-yellow-500"
      />
    </div>
  );
}

// Loading Skeleton Component
export function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Metrics cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
