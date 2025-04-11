import React, { useState, useEffect, memo } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Sun, Moon, User, Lock } from 'lucide-react'
import axios from 'axios';
import config from '../config';

const ParticleAnimation = () => {
  const particleCount = 150
  const particles = Array(particleCount).fill(null)

  const createParticle = (i: number) => {
    const isWhite = Math.random() > 0.6
    const isGolden = !isWhite && Math.random() > 0.5
    const color = isWhite ? '#FFFFFF' : isGolden ? '#FFD700' : '#FF8C00'
    const size = Math.random() * 8 + 3 // 3-11px
    const blur = isWhite ? '1px' : `${Math.random() * 2 + 1}px`
    const opacity = Math.random() * 0.5 + 0.3 // 0.3-0.8
    const duration = Math.random() * 20 + 15 // 15-35 seconds
    const delay = Math.random() * -duration

    return (
      <motion.div
        key={`particle-${i}`}
        className="absolute rounded-full"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          boxShadow: `0 0 ${size / 2}px ${color}`,
          filter: `blur(${blur})`,
        }}
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: 0,
          scale: 1,
        }}
        animate={{
          x: [
            Math.random() * window.innerWidth,
            Math.random() * window.innerWidth,
            Math.random() * window.innerWidth,
          ],
          y: [
            Math.random() * window.innerHeight,
            Math.random() * window.innerHeight,
            Math.random() * window.innerHeight,
          ],
          rotate: 360,
          opacity: [0, opacity, opacity, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: duration,
          times: [0, 0.2, 0.8, 1],
          repeat: Infinity,
          delay: delay,
          ease: "easeInOut",
        }}
      />
    )
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((_, i) => createParticle(i))}
    </div>
  )
}

const Firework = () => {
  const controls = useAnimation()

  useEffect(() => {
    controls.start({
      scale: [0, 1, 0.5],
      opacity: [1, 0.8, 0],
      transition: {
        duration: 2,
        ease: "easeOut",
        times: [0, 0.2, 1],
        repeat: Infinity,
        repeatDelay: Math.random() * 5 + 2,
      },
    })
  }, [controls])

  return (
    <motion.div
      className="absolute w-4 h-4 rounded-full bg-[#FFD700]"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        boxShadow: '0 0 30px 8px rgba(255,215,0,0.7)',
      }}
      animate={controls}
    />
  )
}

const FogLayer = () => {
  return (
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-black to-transparent opacity-20"
      animate={{
        x: ['-100%', '100%'],
      }}
      transition={{
        repeat: Infinity,
        duration: 60,
        ease: "linear",
      }}
    />
  )
}

const AnimatedBackground = memo(() => {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-[#3B7A57] via-[#1C3A52] to-[#0D0D0D]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2A1A5E] to-transparent opacity-30" />
      <ParticleAnimation />
      {Array(10).fill(null).map((_, i) => (
        <Firework key={`firework-${i}`} />
      ))}
      <FogLayer />
      <div className="absolute inset-0 bg-black bg-opacity-40" />
    </>
  );
});

export default function ImmersiveSoccerLoginPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        username,
        password,
      }
      const response = await axios.post(`${config.API_URL}/api/token/`, data);

      const { access, refresh } = response.data;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      window.location.href = '/'

    } catch (err) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-md">
        <Card className={`overflow-hidden ${isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300`}>
          <CardHeader className="space-y-1 text-center">
            <motion.div
              className="mx-auto mb-4 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.img 
                src="/logo.png"
                alt="Sons of Football Logo"
                className="w-20 h-20 object-contain"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
            </motion.div>
            <CardTitle className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Sons of Football</CardTitle>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Inicia sesión para acceder a tu cuenta</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="usern" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Usuario</Label>
                <div className="relative">
                  <Input
                    id="usern"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nombre de Usuario"
                    required
                    className={`pl-10 ${isDarkMode
                        ? 'bg-gray-700/70 text-gray-100 border-gray-600 focus:border-red-500'
                        : 'bg-gray-100/70 text-gray-900 border-gray-300 focus:border-red-500'
                      }`}
                  />
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <Label htmlFor="password" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`pl-10 ${isDarkMode
                        ? 'bg-gray-700/70 text-gray-100 border-gray-600 focus:border-red-500'
                        : 'bg-gray-100/70 text-gray-900 border-gray-300 focus:border-red-500'
                      }`}
                  />
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="submit"
                  className={`w-full ${isDarkMode
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                    } shadow-lg transition-all duration-300`}
                >
                  Iniciar Sesión
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}