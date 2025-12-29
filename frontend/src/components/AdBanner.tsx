import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Cpu, HardDrive, MemoryStick } from 'lucide-react';

const AdBanner = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-800 via-violet-800 to-zinc-900 shadow-2xl shadow-violet-600/30 transition-all duration-300 hover:shadow-violet-600/50">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-72 h-72 bg-violet-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        </div>
        
        {/* Tech Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        {/* Animated Tech Icons */}
        <div className="absolute top-6 left-6 animate-pulse">
          <Cpu className="h-6 w-6 text-violet-300" />
        </div>
        <div className="absolute top-10 right-16 animate-pulse delay-300">
          <MemoryStick className="h-5 w-5 text-violet-200" />
        </div>
        <div className="absolute bottom-8 left-16 animate-pulse delay-700">
          <HardDrive className="h-4 w-4 text-violet-300" />
        </div>
        <div className="absolute top-1/2 right-8 animate-pulse delay-500">
          <Sparkles className="h-5 w-5 text-violet-200" />
        </div>

        <div className="relative px-8 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
            
            {/* Content Section */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 border border-white/30 shadow-lg">
                <Sparkles className="h-4 w-4 text-violet-200" />
                <span className="text-sm font-bold uppercase tracking-wider text-white">
                  Limited Time Offer
                </span>
              </div>

              {/* Heading */}
              <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                Level Up Your{' '}
                <span className="bg-gradient-to-r from-violet-200 via-purple-200 to-violet-300 bg-clip-text text-transparent">
                  PC Performance
                </span>
              </h3>

              {/* Description */}
              <p className="max-w-2xl text-lg sm:text-xl font-medium text-violet-50 leading-relaxed">
                Upgrade your RAM, SSD, and Processors today. Get up to{' '}
                <span className="font-bold text-violet-200 text-2xl">30% OFF</span>{' '}
                on all hardware components. Limited stock available!
              </p>

              {/* Features List */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
                  <div className="h-2 w-2 rounded-full bg-violet-300"></div>
                  <span className="text-sm font-medium">Free Shipping</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
                  <div className="h-2 w-2 rounded-full bg-violet-300"></div>
                  <span className="text-sm font-medium">Warranty Included</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
                  <div className="h-2 w-2 rounded-full bg-violet-300"></div>
                  <span className="text-sm font-medium">Expert Support</span>
                </div>
              </div>
            </div>

            {/* CTA Button Section */}
            <div className="flex-shrink-0">
              <Link
                to="/products"
                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-violet-600 via-violet-700 to-violet-800 px-10 py-5 text-lg font-bold text-white shadow-2xl shadow-violet-500/50 transition-all duration-300 hover:scale-105 hover:shadow-violet-500/70 hover:from-violet-500 hover:via-violet-600 hover:to-violet-700 active:scale-95"
              >
                <span>Shop Now</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default AdBanner;