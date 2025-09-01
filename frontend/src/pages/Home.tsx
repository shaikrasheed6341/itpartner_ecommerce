import { Link } from 'react-router-dom'
import { ArrowRight, Wifi, Monitor, Shield, Camera, Laptop, Server, Phone } from 'lucide-react'

export function Home() {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold  sm:text-4xl md:text-5xl lg:text-5xl/none">
                 IT Partner Your Tech Partner For <br /> Today and Tomorrow
              </h1>
              <p className="mx-auto max-w-[700px] text-zinc-600 dark:text-zinc-400 md:text-xl">
                Professional networking, CCTV surveillance, and computer and Mac services. From network setup to 
                hardware repair, we keep your business connected and secure.
              </p>
            </div>
            <div className="space-x-4">
              <Link
                to="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-800 dark:bg-zinc-200 px-8 text-sm font-medium text-white dark:text-zinc-900 shadow transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-300"
              >
                Our Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-600 bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-zinc-50 dark:bg-zinc-900/20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Comprehensive IT Solutions
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              We provide end-to-end IT services to keep your business running smoothly and securely
            </p>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-4">
                <Wifi className="h-8 w-8 text-zinc-700 dark:text-zinc-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Network Solutions</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  WiFi setup, network infrastructure, VPN configuration, and network security for businesses of all sizes.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-4">
                <Camera className="h-8 w-8 text-zinc-700 dark:text-zinc-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">CCTV & Surveillance</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Professional CCTV installation, monitoring systems, and security camera solutions for your premises.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-4">
                <Laptop className="h-8 w-8 text-zinc-700 dark:text-zinc-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Computer Services</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Laptop repair, Mac services, desktop maintenance, and IT support for all your computing needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Why Choose IT Partner?
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              We're committed to delivering reliable, professional IT services that exceed expectations
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Expert Technicians</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Certified professionals with years of experience in networking and IT solutions
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Round-the-clock technical support and emergency services when you need them most
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                <Server className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                All our work comes with a comprehensive warranty and satisfaction guarantee
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                <Monitor className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Modern Solutions</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Latest technology and industry best practices for optimal performance and security
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Contact us today for a free consultation and quote on your IT needs. 
            Let us help you build a secure, efficient, and reliable IT infrastructure.
          </p>
          <div className="space-x-4">
            <Link
              to="/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-md bg-white dark:bg-zinc-900 px-8 text-sm font-medium text-zinc-900 dark:text-white shadow transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              View Services
            </Link>
            <button className="inline-flex h-12 items-center justify-center rounded-md border border-white/20 dark:border-zinc-900/20 bg-transparent px-8 text-sm font-medium transition-colors hover:bg-white/10 dark:hover:bg-zinc-900/10">
              Get Quote
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
