import { CheckCircle, Users, Target, Award, Wifi, Camera, Laptop, Clock, MapPin, Phone } from 'lucide-react'
import { ContactForm } from '@/components/ContactForm'

export function About() {
  return (
    <div className="flex-1">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
            About IT Partner
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We are a leading IT services company specializing in networking, CCTV surveillance, 
            and computer solutions. With years of experience, we help businesses stay connected, 
            secure, and efficient.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-6">
              To provide reliable, professional IT solutions that empower businesses to operate 
              efficiently and securely in today's digital world. We focus on building long-term 
              partnerships based on trust, quality, and exceptional service.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Expert Solutions</h3>
                  <p className="text-muted-foreground">Certified technicians with deep expertise in networking, CCTV, and computer systems.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Quality Assurance</h3>
                  <p className="text-muted-foreground">Every project undergoes rigorous testing and quality checks before delivery.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Customer Success</h3>
                  <p className="text-muted-foreground">Your success is our success. We're committed to your business growth and IT needs.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">Our Values</h2>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Customer Focus</h3>
                  <p className="text-muted-foreground">We put our customers first, understanding their unique needs and delivering tailored solutions.</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Excellence</h3>
                  <p className="text-muted-foreground">We strive for excellence in every project, maintaining the highest standards of quality.</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Integrity</h3>
                  <p className="text-muted-foreground">We maintain the highest standards of honesty, transparency, and ethical business practices.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Overview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What We Do</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                <Wifi className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Networking Solutions</h3>
              <p className="text-muted-foreground">
                WiFi setup, network infrastructure, security, and troubleshooting for businesses of all sizes.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <Camera className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">CCTV & Surveillance</h3>
              <p className="text-muted-foreground">
                Professional security camera installation, monitoring systems, and maintenance services.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                <Laptop className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Computer Services</h3>
              <p className="text-muted-foreground">
                Laptop repair, Mac services, desktop maintenance, and comprehensive IT support.
              </p>
            </div>
          </div>
        </div>

        {/* Company Stats */}
        <div className="bg-muted/50 rounded-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Numbers</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Happy Clients</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <p className="text-muted-foreground">Projects Completed</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5+</div>
              <p className="text-muted-foreground">Years Experience</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Support Available</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Ready to discuss your IT needs? Contact us for a free consultation and quote. 
              Our team is here to help you find the perfect solution for your business.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span>+91 8639060672</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span>8-2-293/82/BNN/c-101, Flimnager, Hyderabad, Telengana</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-primary" />
                <span>Mon-Fri: 8AM-6PM | Sat: 9AM-3PM</span>
              </div>
            </div>
          </div>
          
          <ContactForm />
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's discuss how we can help transform your business with our professional IT solutions. 
            Contact us today for a free consultation.
          </p>
          <div className="space-x-4">
            <button className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
              Get Free Quote
            </button>
            <button className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
