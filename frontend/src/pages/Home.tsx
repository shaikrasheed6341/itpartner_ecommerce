import { Link } from 'react-router-dom'
import { ArrowRight, Wifi, Monitor, Shield, Camera, Laptop, Server, Phone } from 'lucide-react'
import { Reviews } from '../googlereview/Review'
import heroVideo from '@/assets/Solar_Rotation_Video_Generation.mp4'
export function Home() {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative w-full py-8 md:py-22  lg:py-36 overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source
              src={heroVideo}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 dark:bg-black/70 z-10"></div>
        </div>

        {/* Content */}
        <div className="container relative z-20 px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold sm:text-3xl md:text-3xl lg:text-5xl/none bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                IT Partner Your <span className="text-violet-600"> Tech Partner </span> <br /> For Today and Tomorrow
              </h1>
              <p className="mx-auto max-w-[700px] text-base text-zinc-300">
                Professional networking, CCTV surveillance, and computer and Mac services. From network setup to
                hardware repair, we keep your business connected and secure.
              </p>
            </div>
            <div className="space-x-4 pt-4">
              <Link
                to="/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-md bg-gradient-to-br from-violet-700 via-violet-800 to-violet-900 px-8 text-sm font-medium text-white shadow-lg shadow-violet-500/30 transition-all "
              >
                Our Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/20 bg-white/10 backdrop-blur-sm px-8 text-sm font-medium text-white shadow-sm transition-colors hover:bg-white/20"
              >
                About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="w-full py-16   ">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            {/* Network Solutions Card */}
            <div className="flex flex-col items-start p-8 text-left bg-gradient-to-br from-zinc-800 via-violet-800 to-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6 inline-flex items-center justify-center rounded-lg  p-3 shadow-md shadow-violet-200 dark:shadow-none">
                <Wifi className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Network Solutions
              </h3>
              <p className="text-sm  text-white leading-relaxed font-medium">
                WiFi setup, network infrastructure, VPN configuration, and network security for businesses of all sizes.
              </p>
            </div>

            {/* CCTV & Surveillance Card */}
            <div className="flex flex-col items-start p-8 text-left bg-gradient-to-br from-zinc-800 via-violet-800 to-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6 inline-flex items-center justify-center rounded-lg  p-3 shadow-md shadow-violet-200 dark:shadow-none">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                CCTV & Surveillance
              </h3>
              <p className="text-sm text-white leading-relaxed font-medium">
                Professional CCTV installation, monitoring systems, and security camera solutions for your premises.
              </p>
            </div>

            {/* Computer Services Card */}
            <div className="flex flex-col items-start p-8 text-left bg-gradient-to-br from-zinc-800 via-violet-800 to-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6 inline-flex items-center justify-center rounded-lg  p-3 shadow-md shadow-violet-200 dark:shadow-none">
                <Laptop className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Computer Services
              </h3>
              <p className="text-sm text-white leading-relaxed font-medium">
                Laptop repair, Mac services, desktop maintenance, and IT support for all your computing needs.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Why Choose Us */}
      <section className="w-full py-4 md:py-24 lg:py-4     ">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900  sm:text-2xl md:text-4xl mb-4">
              Why Choose IT Partner?
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              We're committed to delivering reliable, professional IT services that exceed expectations
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-zinc-800 via-violet-800 to-zinc-900 rounded-xl p-6 text-center shadow-lg shadow-violet-600/20 hover:shadow-xl hover:shadow-violet-600/30 hover:-translate-y-1 transition-all duration-300">
              <div className="mx-auto w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Shield className="h-7 w-7 text-violet-600" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Expert Technicians</h3>
              <p className="text-sm text-white/95 leading-relaxed">
                Certified professionals with years of experience in networking, security, and IT infrastructure solutions for businesses
              </p>
            </div>

            <div className="bg-gradient-to-br from-zinc-800 via-violet-800 to-zinc-900 rounded-xl p-6 text-center shadow-lg shadow-violet-600/20 hover:shadow-xl hover:shadow-violet-600/30 hover:-translate-y-1 transition-all duration-300">
              <div className="mx-auto w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Phone className="h-6 w-6 text-violet-600" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">24/7 Support</h3>
              <p className="text-sm text-white/95 leading-relaxed">
                Round-the-clock technical support and emergency services available whenever you need assistance with your IT systems
              </p>
            </div>

            <div className="bg-gradient-to-br from-zinc-800 via-violet-800 to-zinc-900 rounded-xl p-6 text-center shadow-lg shadow-violet-600/20 hover:shadow-xl hover:shadow-violet-600/30 hover:-translate-y-1 transition-all duration-300">
              <div className="mx-auto w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Server className="h-6 w-6 text-violet-600" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Quality Guarantee</h3>
              <p className="text-sm text-white/95 leading-relaxed">
                All our work comes with comprehensive warranty coverage and 100% satisfaction guarantee on every service we provide
              </p>
            </div>

            <div className="bg-gradient-to-br from-zinc-800 via-violet-800 to-zinc-900 rounded-xl p-6 text-center shadow-lg shadow-violet-600/20 hover:shadow-xl hover:shadow-violet-600/30 hover:-translate-y-1 transition-all duration-300">
              <div className="mx-auto w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Monitor className="h-6 w-6 text-violet-600" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Modern Solutions</h3>
              <p className="text-sm text-white/95 leading-relaxed">
                We use the latest technology and follow industry best practices to ensure optimal performance, security, and reliability
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-32 md:py-24 lg:py-12">
        <div className="container px-4 md:px-6">
          <Reviews />
        </div>
      </section>

    </div>
  )
}
