import { Wifi, Camera, Laptop, Server, Shield, Phone, Settings, Zap } from 'lucide-react'

export function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Our Services</h2>
        <p className="text-muted-foreground">
          Professional IT solutions for your business needs
        </p>
      </div>
      
      {/* Service Categories */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Network Solutions */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Wifi className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Network Solutions</h3>
                <p className="text-sm text-muted-foreground">WiFi & Infrastructure</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>WiFi Network Setup & Configuration</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Network Security & Firewall</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>VPN Configuration</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Network Troubleshooting</span>
              </li>
            </ul>

          </div>
        </div>

        {/* CCTV & Surveillance */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Camera className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">CCTV & Surveillance</h3>
                <p className="text-sm text-muted-foreground">Security Systems</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>HD & IP Camera Installation</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>24/7 Monitoring Systems</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Remote Access Setup</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Maintenance & Support</span>
              </li>
            </ul>
            
          </div>
        </div>

        {/* Computer Services */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Laptop className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Computer Services</h3>
                <p className="text-sm text-muted-foreground">Repair & Maintenance</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Laptop & Desktop Repair</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Mac & Apple Services</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Virus Removal</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Hardware Upgrades</span>
              </li>
            </ul>
            
          </div>
        </div>

        {/* IT Support */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Phone className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">IT Support</h3>
                <p className="text-sm text-muted-foreground">24/7 Assistance</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Remote Technical Support</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>On-site Support</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Emergency Response</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Preventive Maintenance</span>
              </li>
            </ul>
            
          </div>
        </div>

        {/* Server Management */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Server className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Server Management</h3>
                <p className="text-sm text-muted-foreground">Infrastructure</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Server Setup & Configuration</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Data Backup Solutions</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Cloud Migration</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Performance Optimization</span>
              </li>
            </ul>
            
          </div>
        </div>

        {/* Cybersecurity */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                <Shield className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Cybersecurity</h3>
                <p className="text-sm text-muted-foreground">Protection & Security</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>Security Audits</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>Firewall Configuration</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>Data Encryption</span>
              </li>
              
            </ul>

          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="rounded-xl border bg-card text-card-foreground shadow p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">Need a Custom Solution?</h3>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          We understand every business has unique IT requirements. Contact us for a personalized 
          consultation and custom solution tailored to your specific needs.
        </p>
        <div className="space-x-4">
          <button className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
            Get Free Quote
          </button>
          <button className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
            Schedule Consultation
          </button>
        </div>
      </div>
    </div>
  )
}
