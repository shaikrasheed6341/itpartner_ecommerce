import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

// Professional Indian & Muslim names for IT Partner context
const reviews = [
  { id: 1, name: "Arjun Mehta", rating: 5, text: "Outstanding technical support. Their team moved our entire database to the cloud without a single minute of downtime.", initial: "AM", color: "bg-orange-600" },
  { id: 2, name: "Zubair Ahmed", rating: 5, text: "Very reliable IT partner. Their managed security services have given us peace of mind regarding our data integrity.", initial: "ZA", color: "bg-emerald-700" },
  { id: 3, name: "Priya Sharma", rating: 4.5, text: "Excellent communication and deep expertise in software architecture. They delivered the project ahead of schedule.", initial: "PS", color: "bg-rose-500" },
  { id: 4, name: "Mohammed Farhan", rating: 5, text: "Their networking solutions streamlined our multi-office connectivity. Highly professional engineers and great support.", initial: "MF", color: "bg-blue-600" },
  { id: 5, name: "Ananya Iyer", rating: 4, text: "The most responsive IT team we've worked with. Their proactive monitoring catches issues before they affect us.", initial: "AI", color: "bg-indigo-500" },
  { id: 6, name: "Siddharth Rao", rating: 5, text: "Helped us modernise our legacy systems. The ROI on their automation services was visible within three months.", initial: "SR", color: "bg-slate-700" },
  { id: 7, name: "Yasmin Khan", rating: 4, text: "Exceptional service for our cybersecurity needs. Professional, discrete, and highly skilled team.", initial: "YK", color: "bg-teal-600" },
  { id: 8, name: "Vikram Singh", rating: 5, text: "A true partner in our digital transformation journey. They understand the business needs, not just the technology.", initial: "VS", color: "bg-amber-600" }
];

export function Reviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsToShow = 4;

  const nextReview = () => {
    if (currentIndex + cardsToShow >= reviews.length) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevReview = () => {
    if (currentIndex === 0) {
      setCurrentIndex(reviews.length - cardsToShow);
    } else {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="w-full py-16 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header with Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Client Success Stories
            </h2>
            <p className="text-gray-500 mt-2 text-lg">
              Hear from our partners across the industry
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={prevReview}
              className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm active:scale-95"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={nextReview}
              className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm active:scale-95"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* 4-Card Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-300">
          {reviews.slice(currentIndex, currentIndex + cardsToShow).map((review) => (
            <div
              key={review.id}
              className="group bg-white rounded-2xl p-6 border border-gray-100 flex flex-col h-full hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
            >
              {/* Rating and Quote Icon */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-200 group-hover:text-blue-100 transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11M14.017 21H11.017V12.5C11.017 9.46243 13.4794 7 16.517 7V9C15.1363 9 14.017 10.1193 14.017 11.5V12.5H16.017C17.6739 12.5 19.017 13.8431 19.017 15.5V18.5C19.017 20.1569 17.6739 21.5 16.017 21.5H14.017V21ZM5.017 21V18C5.017 16.8954 5.91243 16 7.017 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.017C5.46472 8 5.017 8.44772 5.017 9V11M5.017 21H2.017V12.5C2.017 9.46243 4.47944 7 7.517 7V9C6.13629 9 5.017 10.1193 5.017 11.5V12.5H7.017C8.67386 12.5 10.017 13.8431 10.017 15.5V18.5C10.017 20.1569 8.67386 21.5 7.017 21.5H5.017V21Z" />
                  </svg>
                </span>
              </div>

              <p className="text-gray-600 text-[15px] leading-relaxed flex-grow mb-8 font-medium">
                {review.text}
              </p>

              <div className="flex items-center pt-6 border-t border-gray-50">
                {/* Initials Avatar */}
                <div className={`w-11 h-11 rounded-xl ${review.color} flex items-center justify-center text-white font-bold text-sm mr-4 shadow-inner`}>
                  {review.initial}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-none mb-1">
                    {review.name}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center mt-12 space-x-2">
          {Array.from({ length: reviews.length - (cardsToShow - 1) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? "w-10 bg-blue-600" : "w-3 bg-gray-200 hover:bg-gray-300"
                }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}