import { Wifi, Camera, Laptop, Server, Shield, Phone, ArrowRight } from 'lucide-react'

export function Dashboard() {
  return (
    <div className="flex-1">


      {/* Service Categories */}
      <section className="py-12 md:py-16 ">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Network Solutions */}
            <div className="group bg-gradient-to-br from-zinc-800 via-violet-600 to-zinc-900 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 rounded-xl ">
                  <Wifi className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Network Solutions</h3>
                  <p className="text-sm text-white/80">WiFi & Infrastructure</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-white/95">
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <span>WiFi Network Setup & Configuration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <span>Network Security & Firewall</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <span>VPN Configuration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <span>Network Troubleshooting & Optimization</span>
                </li>
              </ul>
            </div>

            {/* CCTV & Surveillance */}
            <div className="group bg-gradient-to-br from-zinc-800 via-violet-600 to-zinc-900 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 rounded-xl shadow-md">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">CCTV & Surveillance</h3>
                  <p className="text-sm text-white/80">Security Systems</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-white/95">
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></div>
                  <span>HD & IP Camera Installation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></div>
                  <span>24/7 Monitoring Systems</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></div>
                  <span>Remote Access Setup</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></div>
                  <span>Maintenance & Support Services</span>
                </li>
              </ul>
            </div>

            {/* Computer Services */}
            <div className="group bg-gradient-to-br from-zinc-800 via-violet-600  to-zinc-900 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 rounded-xl shadow-md">
                  <Laptop className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Computer Services</h3>
                  <p className="text-sm text-white/80">Repair & Maintenance</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-white/95">
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                  <span>Laptop & Desktop Repair</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                  <span>Mac & Apple Services</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                  <span>Virus Removal & Security</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                  <span>Hardware Upgrades & Installation</span>
                </li>
              </ul>
            </div>

            {/* IT Support */}
            <div className="group bg-gradient-to-br from-zinc-800 via-violet-800 to-zinc-900 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 rounded-xl">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">IT Support</h3>
                  <p className="text-sm text-white/80">24/7 Assistance</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-white/95">
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                  <span>Remote Technical Support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                  <span>On-site Support Services</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                  <span>Emergency Response Team</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                  <span>Preventive Maintenance Plans</span>
                </li>
              </ul>
            </div>

            {/* Server Management */}
            <div className="group bg-gradient-to-br from-zinc-800 via-violet-800 to-zinc-900 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 rounded-xl">
                  <Server className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Server Management</h3>
                  <p className="text-sm text-white/80">Infrastructure</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-white/95">
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0"></div>
                  <span>Server Setup & Configuration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0"></div>
                  <span>Data Backup Solutions</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0"></div>
                  <span>Cloud Migration Services</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0"></div>
                  <span>Performance Optimization</span>
                </li>
              </ul>
            </div>

            {/* Cybersecurity */}
            <div className="group bg-gradient-to-br from-zinc-800 via-violet-800 to-zinc-900 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 rounded-xl">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Cybersecurity</h3>
                  <p className="text-sm text-white/80">Protection & Security</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-white/95">
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0"></div>
                  <span>Comprehensive Security Audits</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0"></div>
                  <span>Firewall Configuration & Management</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0"></div>
                  <span>Data Encryption Solutions</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0"></div>
                  <span>Threat Detection & Response</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-violet-600 via-purple-600 to-violet-800 text-white overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>

        <div className="container relative z-10 px-4 md:px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-violet-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
              Need a Custom Solution?
            </h2>
            <p className="text-lg md:text-xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed">
              We understand every business has unique IT requirements. Contact us for a personalized
              consultation and custom solution tailored to your specific needs.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <button className="group inline-flex h-16 items-center justify-center rounded-2xl bg-white px-12 text-lg font-bold text-violet-700 shadow-2xl shadow-violet-900/40 transition-all hover:bg-violet-50 hover:scale-110 hover:shadow-2xl hover:shadow-violet-900/60 active:scale-95">
                Get Free Quote
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button className="inline-flex h-16 items-center justify-center rounded-2xl border-2 border-white/40 bg-white/15 backdrop-blur-md px-12 text-lg font-bold text-white transition-all hover:bg-white/25 hover:border-white/60 hover:scale-110 hover:shadow-2xl hover:shadow-white/20 active:scale-95">
                Schedule Consultation
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>24/7 Support Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Free Consultation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Expert Technicians</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
