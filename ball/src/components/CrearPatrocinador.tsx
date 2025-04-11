"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Upload } from 'lucide-react'
import { motion } from 'framer-motion'
import config from '../config';
import axiosInstance from '@/contexts/axiosConfig'

export default function CrearPatrocinador() {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('Patrocinador')
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState({ nombre: false, descripcion: false })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = {
      nombre: nombre.trim() === '',
      descripcion: descripcion.trim() === ''
    }
    setErrors(newErrors)

    if (!newErrors.nombre && !newErrors.descripcion) {
      const formData = new FormData()
      formData.append('nombre', nombre)
      formData.append('descripcion', descripcion)
      if (file) {
        formData.append('logo', file)
      }

      try {
        const response = axiosInstance.post('/patrocinador/nuevo/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        setNombre('')
        setDescripcion('Patrocinador')
        setFile(null)
        setErrors({ nombre: false, descripcion: false })
        console.log('Patrocinador creado con éxito')
      }
      catch (error) {
        console.error('Error:', error)
      }
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
          <Card className="max-w-2xl mx-auto bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">Crear Nuevo Patrocinador</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-gray-900 dark:text-gray-100">Nombre del Patrocinador</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={`bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-gray-500 focus:ring-gray-500 ${errors.nombre ? 'border-gray-500' : ''}`}
                    placeholder="Introduce el nombre del patrocinador"
                  />
                  {errors.nombre && (
                    <p className="text-gray-500 text-sm flex items-center mt-1">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      El nombre del patrocinador es requerido
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo" className="text-gray-800 dark:text-white">Logo del Patrocinador</Label>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="logo" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors duration-300">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400 dark:text-gray-300" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-300">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                      </div>
                      <Input
                        id="logo"
                        type="file"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        accept="image/*"
                      />
                    </label>
                  </div>
                  {file && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Archivo seleccionado: {file.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion" className="text-gray-800 dark:text-white">Descripción</Label>
                  <Input
                    id="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className={`bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-gray-500 focus:ring-gray-500 ${errors.descripcion ? 'border-gray-500' : ''}`}
                    placeholder="Introduce la descripción del patrocinador"
                  />
                  {errors.descripcion && (
                    <p className="text-gray-500 text-sm flex items-center mt-1">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      La descripción es requerida
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600 transition-colors duration-300 transform hover:scale-105"
                >
                  Crear Patrocinador
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

