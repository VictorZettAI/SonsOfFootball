import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { logout } from '@/contexts/logout';
import { Check_Validation } from "@/contexts/cheking"

const Nav: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [validado, setValidado] = useState(false)
  const enlaces = {
    "Crear Liga": "/Crear/Liga/",
    "Crear Torneo": "/Crear/Torneo/",
    "Crear Mundial": "/Crear/Champions/",
    "Crear Equipo": "/Crear/Equipo/",
    "Crear Patrocinador": "/Crear/Patrocinador/",
    "Crear Merchandising": "/Crear/Merchandising/"
  }

  useEffect(() => {
    Check_Validation().then((variable) => {
      console.log(variable)
      setValidado(variable)
    })
  }, [])

  useEffect(() => {
    const darkModePreference = localStorage.getItem('darkMode')
    setIsDarkMode(darkModePreference === 'true')
  }, [])

  useEffect(() => {
    console.log(isDarkMode)
    document.documentElement.classList.toggle('dark', isDarkMode)
    localStorage.setItem('darkMode', isDarkMode.toString())
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode)
  }

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-500 ${isDarkMode ? 'dark bg-gray-900 shadow-lg shadow-gray-800/50' : 'bg-white shadow-md'}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="text-2xl font-bold flex items-center space-x-2">
            <motion.img
              src="/logo.png"
              alt="Sons of Football Logo"
              className="w-14 h-14 object-contain"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
            <span className={`font-bold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Sons of Football</span>
          </a>
          {validado && (
            <nav className="hidden lg:flex items-center justify-center flex-grow relative">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300 hover:text-red-400' : 'text-gray-600 hover:text-red-600'
                    }`}
                >
                  Admin
                </button>

                {isDropdownOpen && (
                  <div
                    className={`absolute left-0 mt-2 shadow-lg rounded-md ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'
                      } min-w-max`}
                  >
                    <ul className="px-4 py-2 space-y-3">
                      {['Crear Liga', 'Crear Torneo', 'Crear Mundial', 'Crear Equipo', 'Crear Patrocinador', 'Crear Merchandising'].map(
                        (option) => (
                          <li key={option} className="w-full">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <a
                                href={enlaces[option]}
                                className={`font-medium block transition-colors duration-300 ${isDarkMode
                                  ? 'text-gray-300 hover:text-red-400'
                                  : 'text-gray-600 hover:text-red-600'
                                  }`}
                              >
                                {option}
                              </a>
                            </motion.div>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={() => logout()}
                className={`font-medium transition-colors duration-300 absolute right-0 mr-4 ${isDarkMode ? 'text-gray-300 hover:text-red-400' : 'text-gray-600 hover:text-red-600'
                  }`}
              >
                Cerrar Sesión
              </button>
            </nav>
          )}
          <div className="flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                aria-label="Cambiar modo oscuro"
                className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300 hover:text-red-400' : 'text-gray-600 hover:text-red-600'}`}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className={`lg:hidden ${isDarkMode ? 'text-gray-300 hover:text-red-400' : 'text-gray-600 hover:text-red-600'}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </motion.div>
          </div>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              className="mt-4 lg:hidden"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ul className="space-y-2">
                {['Inicio', 'Torneos', 'Ligas', 'Partidos', 'Estadísticas', 'Noticias', 'Tienda', 'Comunidad'].map((item) => (
                  <motion.li key={item} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <a
                      href="#"
                      className={`block py-2 px-4 rounded transition-colors duration-300 ${isDarkMode
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-red-400'
                        : 'text-gray-600 hover:bg-gray-200 hover:text-red-600'
                        }`}
                    >
                      {item}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
};

export default Nav;
