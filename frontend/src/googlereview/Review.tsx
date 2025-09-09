import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

// Sample reviews data - you can replace these with your actual Google reviews
const reviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    text: "Excellent service! The team was professional and delivered exactly what we needed. Highly recommended for any IT solutions.",
    date: "2024-01-15",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    verified: true
  },
  {
    id: 2,
    name: "Michael Chen",
    rating: 5,
    text: "Outstanding work! They helped us modernize our entire IT infrastructure. The project was completed on time and within budget.",
    date: "2024-01-10",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    verified: true
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    rating: 5,
    text: "Professional team with great communication throughout the project. They solved our complex technical challenges efficiently.",
    date: "2024-01-08",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    verified: true
  },
  {
    id: 4,
    name: "David Thompson",
    rating: 5,
    text: "Top-notch IT services! Their expertise in cloud solutions helped us scale our business. Will definitely work with them again.",
    date: "2024-01-05",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    verified: true
  },
  {
    id: 5,
    name: "Lisa Wang",
    rating: 5,
    text: "Amazing support team! They were available 24/7 during our critical system migration. Couldn't have done it without them.",
    date: "2024-01-02",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    verified: true
  }
];

export function Reviews() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const formatGoogleDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
          Customer Reviews
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          See what our customers are saying about our IT services
        </p>
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Google Review Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Google Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
                  alt="Google"
                  className="h-5"
                />
                <span className="text-sm text-gray-600">Google</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900">5.0</span>
              </div>
            </div>
          </div>

          {/* Review Content */}
          <div className="p-4">
            {/* User Info */}
            <div className="flex items-start space-x-3 mb-3">
              <img
                src={reviews[currentIndex].avatar}
                alt={reviews[currentIndex].name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-gray-900 text-sm">
                    {reviews[currentIndex].name}
                  </h3>
                  {reviews[currentIndex].verified && (
                    <div className="flex items-center">
                      <svg className="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <span className="text-xs text-blue-600 ml-1">Verified</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center">
                    {renderStars(reviews[currentIndex].rating)}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatGoogleDate(reviews[currentIndex].date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Review Text */}
            <div className="mb-4">
              <p className="text-sm text-gray-800 leading-relaxed">
                {reviews[currentIndex].text}
              </p>
            </div>

            {/* Google Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                  </svg>
                  <span className="text-xs">Share</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span className="text-xs">Save</span>
                </button>
              </div>
              <div className="flex items-center space-x-1 text-gray-500">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span className="text-xs">Google</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center items-center mt-6 space-x-4">
          <button
            onClick={prevReview}
            className="p-2 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            aria-label="Previous review"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex space-x-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-blue-500" : "bg-gray-300"
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
          
          <button
            onClick={nextReview}
            className="p-2 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            aria-label="Next review"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* View All Reviews Link */}
        <div className="text-center mt-6">
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <img
              src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
              alt="Google"
              className="h-4 mr-2"
            />
            View all reviews on Google
          </button>
        </div>
      </div>
    </div>
  );
}
