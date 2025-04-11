"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from 'lucide-react'
import config from '../config';
import axiosInstance from '@/contexts/axiosConfig'

interface Equipo {
  id: number;
  nombre: string;
}

export default function CrearJugador() {
  const params = useParams()
  const equipoId = params.id ? parseInt(params.id as string) : null

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [formData, setFormData] = useState({
    nombre: '',
    edad: '',
    nacionalidad: '',
    posicion: '',
    equipo: equipoId ? equipoId.toString() : '',
    numero: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch(`${config.API_URL}/equipo/lista/`)
      .then(response => response.json())
      .then((data: Equipo[]) => {
        setEquipos(data);
        if (equipoId) {
          const selectedTeam = data.find(equipo => equipo.id === equipoId);
          if (selectedTeam) {
            setFormData(prev => ({ ...prev, equipo: selectedTeam.id.toString() }));
          }
        }
      })
      .catch(error => {
        console.error('Error cargando equipos:', error);
        setErrors(prev => ({ ...prev, equipo: 'Error cargando equipos' }));
      });

  }, [equipoId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    let newErrors: Record<string, string> = {}
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.edad || parseInt(formData.edad) <= 0) newErrors.edad = 'La edad debe ser un número positivo'
    if (!formData.nacionalidad.trim()) newErrors.nacionalidad = 'La nacionalidad es requerida'
    if (!formData.posicion) newErrors.posicion = 'La posición es requerida'
    if (!formData.equipo) newErrors.equipo = 'Debe seleccionar un equipo'
    if (!formData.numero || parseInt(formData.numero) <= 0) newErrors.numero = 'El número debe ser positivo'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const response = await axiosInstance.post(`/jugador/nuevo/`, formData)
      const data = await response.data
      console.log('Jugador creado:', data)
      // Redirigir al usuario a la página del equipo después de crear el jugador
      window.location.href = `/equipo/${formData.equipo}`
    }
    catch (error) {
      console.error('Error al crear jugador:', error)
      setErrors({ submit: 'Error al crear jugador' })
    }
    finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">Crear Nuevo Jugador</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-gray-900 dark:text-gray-100">Nombre del Jugador</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    placeholder="Ingrese el nombre completo"
                  />
                  {errors.nombre && <p className="text-red-500 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.nombre}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edad" className="text-gray-900 dark:text-gray-100">Edad</Label>
                  <Input
                    id="edad"
                    name="edad"
                    type="number"
                    value={formData.edad}
                    onChange={handleInputChange}
                    className="bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    placeholder="Ingrese la edad"
                    min="1"
                  />
                  {errors.edad && <p className="text-red-500 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.edad}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nacionalidad" className="text-gray-900 dark:text-gray-100">Nacionalidad</Label>
                  <Input
                    id="nacionalidad"
                    name="nacionalidad"
                    value={formData.nacionalidad}
                    onChange={handleInputChange}
                    className="bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    placeholder="Ingrese la nacionalidad"
                  />
                  {errors.nacionalidad && <p className="text-red-500 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.nacionalidad}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="posicion" className="text-gray-900 dark:text-gray-100">Posición</Label>
                  <Select onValueChange={(value) => handleSelectChange('posicion', value)} value={formData.posicion}>
                    <SelectTrigger className="bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                      <SelectValue placeholder="Seleccione la posición" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        ['portero', 'Portero'],
                        ['defensa_lateral_izquierdo', 'Defensa Lateral Izquierdo'],
                        ['defensa_central', 'Defensa Central'],
                        ['defensa_lateral_derecho', 'Defensa Lateral Derecho'],
                        ['medio_centro', 'Medio Centro'],
                        ['medio_centro_defensivo', 'Medio Centro Defensivo'],
                        ['medio_centro_ofensivo', 'Medio Centro Ofensivo'],
                        ['extremo_izquierdo', 'Extremo Izquierdo'],
                        ['delantero_centro', 'Delantero Centro'],
                        ['extremo_derecho', 'Extremo Derecho']
                      ].map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.posicion && <p className="text-red-500 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.posicion}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipo" className="text-gray-900 dark:text-gray-100">Equipo</Label>
                  <Select onValueChange={(value) => handleSelectChange('equipo', value)} value={formData.equipo}>
                    <SelectTrigger className="bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                      <SelectValue placeholder="Seleccione el equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipos.map((equipo) => (
                        <SelectItem key={equipo.id} value={equipo.id.toString()}>{equipo.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.equipo && <p className="text-red-500 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.equipo}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero" className="text-gray-900 dark:text-gray-100">Número de Camiseta</Label>
                  <Input
                    id="numero"
                    name="numero"
                    type="number"
                    value={formData.numero}
                    onChange={handleInputChange}
                    className="bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    placeholder="Ingrese el número de camiseta"
                    min="1"
                  />
                  {errors.numero && <p className="text-red-500 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.numero}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700 transition-colors duration-300 transform hover:scale-105"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creando...' : 'Crear Jugador'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

