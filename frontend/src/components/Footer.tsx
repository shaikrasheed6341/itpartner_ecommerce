import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Monitor, ArrowRight } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-violet-50 text-zinc-600 font-sans border-t border-violet-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">

          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-violet-600 to-violet-600 rounded-lg shadow-md">
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-zinc-900">
                IT Partner
              </span>
            </div>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Empowering your business with cutting-edge IT solutions. From network infrastructure to advanced security systems, we are your trusted technology partner.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <SocialLink href="#" icon={<Facebook className="h-5 w-5" />} label="Facebook" />
              <SocialLink href="#" icon={<Twitter className="h-5 w-5" />} label="Twitter" />
              <SocialLink href="#" icon={<Instagram className="h-5 w-5" />} label="Instagram" />
              <SocialLink href="#" icon={<Linkedin className="h-5 w-5" />} label="LinkedIn" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-zinc-900 font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/products" label="Products" />
              <FooterLink to="/about" label="About Us" />
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-zinc-900 font-semibold text-lg mb-6">Our Services</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-violet-600 transition-colors"></span>
                <span className="text-zinc-600 group-hover:text-violet-600 transition-colors">Network Solutions</span>
              </li>
              <li className="flex items-center space-x-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-violet-600 transition-colors"></span>
                <span className="text-zinc-600 group-hover:text-violet-600 transition-colors">CCTV & Surveillance</span>
              </li>
              <li className="flex items-center space-x-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-violet-600 transition-colors"></span>
                <span className="text-zinc-600 group-hover:text-violet-600 transition-colors">Hardware Repair</span>
              </li>
              <li className="flex items-center space-x-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-violet-600 transition-colors"></span>
                <span className="text-zinc-600 group-hover:text-violet-600 transition-colors">Software Installation</span>
              </li>
              <li className="flex items-center space-x-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-violet-600 transition-colors"></span>
                <span className="text-zinc-600 group-hover:text-violet-600 transition-colors">IT Consulting</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-zinc-900 font-semibold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-zinc-800 shrink-0 mt-0.5" />
                <span className="text-zinc-800 text-sm">
                  8-2-293/82/BNN/c-101,<br />
                  Flimnager, Hyderabad,<br />
                  Telangana, India
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-zinc-800 shrink-0" />
                <span className="text-zinc-800 text-sm">+91 8639060672</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-zinc-900 shrink-0" />
                <span className="text-zinc-800 text-sm">support@itpartner.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-violet-200 py-8 mt-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-500 text-sm text-center md:text-left">
              &copy; {currentYear} IT Partner. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-zinc-500">
              <Link to="#" className="hover:text-violet-800 transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-violet-800 transition-colors">Terms of Service</Link>
              <Link to="#" className="hover:text-violet-800 transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-gradient-to-br hover:from-violet-600 hover:to-violet-600 text-violet-600 hover:text-white transition-all duration-300 border border-violet-200 shadow-sm hover:shadow-md"
    >
      {icon}
    </a>
  )
}

function FooterLink({ to, label }: { to: string; label: string }) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-center text-zinc-600 hover:text-violet-800 transition-colors group"
      >
        <ArrowRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-violet-800" />
        {label}
      </Link>
    </li>
  )
}
