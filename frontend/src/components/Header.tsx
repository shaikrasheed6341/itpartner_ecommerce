import { Link } from 'react-router-dom'
import { Moon, Sun, Menu, X, Monitor, Shield } from 'lucide-react'
import { useTheme } from './theme-provider'
import { useState } from 'react'

export function Header() {
  const { theme, setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Company Name - Left Side */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <img 
                src="/logo.jpg" 
                alt="IT Partner Logo" 
                className="h-8 w-8 object-cover rounded"
              />
            </div>
            <span className="font-bold text-xl text-zinc-800 dark:text-zinc-200"> 
             <span className='text-blue-600'>I</span><span className='text-zinc-800 dark:text-zinc-200'>T</span> <span className='text-zinc-800 dark:text-zinc-200'>P</span><span className='text-blue-600 '>A</span><span className='text-zinc-800 dark:text-zinc-200'>R</span><span className='text-blue-600'>T</span><span className='text-zinc-800 dark:text-zinc-200'>N</span><span className='text-blue-600'>E</span><span className='text-zinc-800 dark:text-zinc-200'>R</span>
            </span>
          </div>
        </div>
        
        {/* Navigation - Right Side */}
        <div className="flex items-center space-x-6">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400"
            >
              Services
            </Link>
            <Link
              to="/about"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400"
            >
              About Us
            </Link>
          </nav>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 h-10 w-10"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </button>
          
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 h-10 w-10 md:hidden"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="container py-4 space-y-4">
            <Link
              to="/"
              className="block py-2 text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="block py-2 text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/about"
              className="block py-2 text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
