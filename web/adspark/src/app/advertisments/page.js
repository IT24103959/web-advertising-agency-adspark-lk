"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdvertisementService from "../../services/advertisementService";
import AnalyticsService from "../../services/analyticsService";
import Image from "next/image";
import Link from "next/link";

export default function PublicAdvertisementsPage() {
  const router = useRouter();
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const ads = await AdvertisementService.getPublicAdvertisements();
        setAdvertisements(ads);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, []);

  const handleAdvertisementClick = async (advertisement) => {
    try {
      // Track click event
      await AnalyticsService.trackEvent({
        eventType: "CLICK",
        advertisementId: advertisement.id,
        page: "public_advertisements",
        metadata: {
          advertTitle: advertisement.title,
          clientName: advertisement.client?.name,
          timestamp: new Date().toISOString(),
        },
      });

      // Navigate to advertisement details page
      router.push(`/advertisement/view-details/${advertisement.id}`);
    } catch (error) {
      console.warn("Failed to track click event:", error);
      // Still navigate even if tracking fails
      router.push(`/advertisement/view-details/${advertisement.id}`);
    }
  };

  const handleAdvertisementImpression = async (advertisement) => {
    try {
      // Track impression event
      await AnalyticsService.trackEvent({
        eventType: "IMPRESSION",
        advertisementId: advertisement.id,
        page: "public_advertisements",
        metadata: {
          advertTitle: advertisement.title,
          clientName: advertisement.client?.name,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.warn("Failed to track impression event:", error);
    }
  };

  // Track impressions when advertisements come into view
  useEffect(() => {
    const observerOptions = {
      threshold: 0.5, // Track when 50% of the ad is visible
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const adId = entry.target.getAttribute("data-ad-id");
          const advertisement = advertisements.find(
            (ad) => ad.id.toString() === adId
          );
          if (advertisement) {
            handleAdvertisementImpression(advertisement);
          }
        }
      });
    }, observerOptions);

    // Observe all advertisement cards
    const adCards = document.querySelectorAll("[data-ad-id]");
    adCards.forEach((card) => observer.observe(card));

    return () => {
      adCards.forEach((card) => observer.unobserve(card));
    };
  }, [advertisements]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading advertisements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Advertisements
          </h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Featured Advertisements
              </h1>
              <p className="text-gray-600 mt-2">
                Discover amazing advertisements from our creative partners
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {advertisements.length} advertisement
              {advertisements.length !== 1 ? "s" : ""} available
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <svg
                className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-700 font-medium">Advertisements</span>
            </li>
          </ol>
        </nav>
      </div>

      {/* Advertisements Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {advertisements.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📢</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No Advertisements Available
            </h3>
            <p className="text-gray-500">
              Check back later for new featured advertisements.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advertisements.map((advertisement) => (
              <div
                key={advertisement.id}
                data-ad-id={advertisement.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer"
                onClick={() => handleAdvertisementClick(advertisement)}
              >
                {/* Advertisement Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                  {advertisement.assetUrl ? (
                    <Image
                      src={advertisement.assetUrl}
                      alt={advertisement.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-white text-6xl">
                      📢
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-90 text-gray-800">
                      {advertisement.type || "Advertisement"}
                    </span>
                  </div>
                </div>

                {/* Advertisement Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                      {advertisement.title}
                    </h3>
                  </div>

                  {advertisement.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {advertisement.description}
                    </p>
                  )}

                  {/* Client Information */}
                  {advertisement.client && (
                    <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-semibold text-sm">
                          {advertisement.client.name
                            ?.charAt(0)
                            ?.toUpperCase() || "C"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {advertisement.client.name}
                        </p>
                        {advertisement.client.email && (
                          <p className="text-xs text-gray-500">
                            {advertisement.client.email}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Advertisement Details */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    {advertisement.budget && (
                      <span className="flex items-center">
                        💰 Budget:{" "}
                        {AdvertisementService.formatCurrency(
                          advertisement.budget
                        )}
                      </span>
                    )}
                    {advertisement.createdAt && (
                      <span className="text-xs">
                        {new Date(advertisement.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex space-x-2">
                    <button
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdvertisementClick(advertisement);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      {advertisements.length > 0 && (
        <div className="bg-blue-600 text-white py-12">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">
              Want to Advertise with Us?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join our platform and showcase your brand to thousands of
              potential customers.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Get Started Today
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
