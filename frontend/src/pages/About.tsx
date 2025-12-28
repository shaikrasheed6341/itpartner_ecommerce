import { CheckCircle, Users, Target, Award, Wifi, Camera, Laptop, Clock, MapPin, Phone, MessageSquare, ArrowRight, ShieldCheck, Heart } from 'lucide-react'
import { ContactForm } from '@/components/ContactForm'
import { Link } from 'react-router-dom'

export function About() {
  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-900 via-violet-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-violet-200">
              Empowering Your Digital Future
            </h1>
            <p className="text-lg text-violet-100 max-w-2xl mx-auto leading-relaxed">
              We are IT Partner, your trusted ally in navigating the complex world of technology.
              From networking to surveillance, we deliver solutions that drive growth and security.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-16 -mt-20 relative z-20">
        {/* Mission Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 mb-20 border border-white/20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-violet-100 text-violet-800 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                <Target className="h-4 w-4" />
                <span>Our Mission</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Building Trust Through Technology
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                To provide reliable, professional IT solutions that empower businesses to operate
                efficiently and securely in today's digital world. We focus on building long-term
                partnerships based on trust, quality, and exceptional service.
              </p>

              <div className="space-y-4">
                {[
                  { title: 'Expert Solutions', desc: 'Certified technicians with deep expertise in networking, CCTV, and computer systems.' },
                  { title: 'Quality Assurance', desc: 'Every project undergoes rigorous testing and quality checks before delivery.' },
                  { title: 'Customer Success', desc: 'Your success is our success. We are committed to your business growth and IT needs.' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-violet-600 rounded-2xl rotate-3 opacity-10"></div>
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Team Collaboration"
                className="relative rounded-2xl shadow-xl w-full h-auto object-cover aspect-video"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 max-w-xs hidden md:block">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">
                        U{i}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-slate-600">Trusted by 500+ clients</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full w-4/5 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Core Values That Drive Us</h2>
            <p className="text-lg text-slate-600">
              Our culture is built on a foundation of integrity, innovation, and a relentless focus on customer satisfaction.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Customer First', desc: 'We prioritize your needs, delivering tailored solutions that truly fit your business goals.', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: ShieldCheck, title: 'Uncompromising Quality', desc: 'Excellence is not an act, but a habit. We maintain the highest standards in every project.', color: 'text-violet-600', bg: 'bg-violet-50' },
              { icon: Heart, title: 'Integrity & Trust', desc: 'We operate with transparency and honesty, building relationionships that last for years.', color: 'text-rose-600', bg: 'bg-rose-50' }
            ].map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group">
                <div className={`w-14 h-14 ${value.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className={`h-7 w-7 ${value.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Services Overview Gradient Card */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 md:p-16 mb-24 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -ml-48 -mb-48"></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-12 text-center">Comprehensive IT Expertise</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Wifi, title: 'Networking', desc: 'Enterprise-grade WiFi, secure infrastructure, and robust connectivity solutions.' },
                { icon: Camera, title: 'Surveillance', desc: 'State-of-the-art CCTV systems ensuring 24/7 security and peace of mind.' },
                { icon: Laptop, title: 'Computer Care', desc: 'Expert repair, maintenance, and support for all your hardware needs.' }
              ].map((service, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/15 transition-colors text-center">
                  <service.icon className="h-10 w-10 text-violet-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-slate-300 text-sm">{service.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link to="/dashboard" className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-slate-900 font-semibold hover:bg-violet-50 transition-colors shadow-lg">
                Explore All Services <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16 items-start">
          <div>
            <div className="sticky top-24">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Let's Connect</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Ready to transform your IT infrastructure? Reach out to us for a free consultation.
                Our team is standing by to help you find the perfect solution tailored to your needs.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Phone, label: 'Call Us', value: '+91 8639060672', color: 'text-violet-600', bg: 'bg-violet-50' },
                  { icon: MapPin, label: 'Visit Us', value: '8-2-293/82/BNN/c-101, Flimnager, Hyderabad, Telengana', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { icon: Clock, label: 'Business Hours', value: 'Mon-Fri: 8AM-6PM | Sat: 9AM-3PM', color: 'text-emerald-600', bg: 'bg-emerald-50' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className={`p-3 ${item.bg} rounded-lg`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
                      <p className="font-medium text-slate-900">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-100 rounded-bl-full -mr-16 -mt-16 opacity-50"></div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 relative z-10">Send us a Message</h3>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
