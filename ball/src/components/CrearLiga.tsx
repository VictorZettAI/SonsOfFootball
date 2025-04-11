"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Users, Trophy, Search, ChevronRight, User, Calendar, MapPin, FileText, Image } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'
import config from '../config';
import axiosInstance from '@/contexts/axiosConfig'

type Equipo = {
  id: number
  nombre: string
  escudo: string
}

type Patrocinador = {
  id: number
  nombre: string
  logo: string
}

export default function CrearLiga() {
  const navigate = useNavigate();
  const [cantidadEquipos, setCantidadEquipos] = useState(2)
  const [equiposDisponibles, setEquiposDisponibles] = useState<Equipo[]>([])
  const [equiposSeleccionados, setEquiposSeleccionados] = useState<Equipo[]>([])
  const [patrocinadoresDisponibles, setPatrocinadoresDisponibles] = useState<Patrocinador[]>([])
  const [patrocinadoresSeleccionados, setPatrocinadoresSeleccionados] = useState<Patrocinador[]>([])
  const [tipo, setTipo] = useState('ida')
  const [busqueda, setBusqueda] = useState('')
  const [nombre, setNombre] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFinal, setFechaFinal] = useState('')
  const [localizacion, setLocalizacion] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [imagen, setImagen] = useState<File | null>(null)
  const [organizador, setOrganizador] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchEquipos()
    fetchPatrocinadores()
  }, [])

  const fetchEquipos = async () => {
    try {
      const response = await fetch(`${config.API_URL}/equipo/lista/`)
      if (response.ok) {
        const data = await response.json()
        setEquiposDisponibles(data)
      } else {
        console.error('Error al obtener equipos')
        toast.error('Error al cargar los equipos. Por favor, intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error de red:', error)
      toast.error('Error de conexión. Por favor, verifica tu conexión a internet.')
    }
  }

  const fetchPatrocinadores = async () => {
    try {
      const response = await fetch(`${config.API_URL}/patrocinador/`)
      if (response.ok) {
        const data = await response.json()
        setPatrocinadoresDisponibles(data)
      } else {
        console.error('Error al obtener patrocinadores')
        toast.error('Error al cargar los patrocinadores. Por favor, intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error de red:', error)
      toast.error('Error de conexión. Por favor, verifica tu conexión a internet.')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImagen(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      setImagen(file)
    }
  }

  const toggleSeleccionEquipo = (equipo: Equipo) => {
    if (equiposSeleccionados.some(e => e.id === equipo.id)) {
      setEquiposSeleccionados(equiposSeleccionados.filter(e => e.id !== equipo.id))
    } else if (equiposSeleccionados.length < cantidadEquipos) {
      setEquiposSeleccionados([...equiposSeleccionados, equipo])
    } else {
      toast.error(`Ya has seleccionado el máximo de ${cantidadEquipos} equipos`)
    }
  }

  const toggleSeleccionPatrocinador = (patrocinador: Patrocinador) => {
    if (patrocinadoresSeleccionados.some(p => p.id === patrocinador.id)) {
      setPatrocinadoresSeleccionados(patrocinadoresSeleccionados.filter(p => p.id !== patrocinador.id))
    } else {
      setPatrocinadoresSeleccionados([...patrocinadoresSeleccionados, patrocinador])
    }
  }

  const crearLiga = async () => {
    if (equiposSeleccionados.length !== cantidadEquipos) {
      toast.error(`Debes seleccionar exactamente ${cantidadEquipos} equipos`)
      return
    }

    if (!nombre || !fechaInicio || !fechaFinal || !localizacion || !organizador) {
      toast.error('Por favor, completa todos los campos obligatorios')
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()

      formData.append('nombre', nombre)
      formData.append('tipo', tipo === 'ida' ? 'ida' : 'ida_vuelta')
      formData.append('organizador', organizador)
      formData.append('fecha_inicio', fechaInicio)
      formData.append('fecha_final', fechaFinal)
      formData.append('localizacion', localizacion)
      formData.append('descripcion', descripcion)
      formData.append('empezado', 'false')
      formData.append('finalizado', 'false')

      if (imagen) {
        formData.append('imagen', imagen)
      }

      equiposSeleccionados.forEach(equipo => {
        formData.append('equipos', equipo.id.toString())
      })

      patrocinadoresSeleccionados.forEach(patrocinador => {
        formData.append('patrocinadores', patrocinador.id.toString())
      })
      const response = await axiosInstance.post(`/liga/create/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      const data = await response.data;
      console.log(data)
      toast.success('Liga creada exitosamente')
      limpiarFormulario()
      navigate(`/liga/${data.id}`)
    } 
    catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear la liga')
    } 
    finally {
      setIsLoading(false)
    }
  }

  const limpiarFormulario = () => {
    setNombre('')
    setTipo('ida')
    setOrganizador('')
    setFechaInicio('')
    setFechaFinal('')
    setLocalizacion('')
    setDescripcion('')
    setImagen(null)
    setEquiposSeleccionados([])
    setPatrocinadoresSeleccionados([])
    setCantidadEquipos(2)
  }

  const equiposFiltrados = equiposDisponibles.filter(equipo =>
    equipo.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 shadow-md mb-6">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-400 flex items-center">
                <Users className="mr-2 h-6 w-6" />
                Configuración de la Liga
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <Label htmlFor="cantidadEquipos" className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                    <Users className="mr-2 h-4 w-4" />
                    Cantidad de Equipos
                  </Label>
                  <Select value={cantidadEquipos.toString()} onValueChange={(value) => setCantidadEquipos(Number(value))}>
                    <SelectTrigger id="cantidadEquipos" className="w-full bg-gray-50 dark:bg-slate-700 text-red-700 dark:text-red-400 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Seleccionar cantidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nombre" className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                    <Trophy className="mr-2 h-4 w-4" />
                    Nombre del Torneo
                  </Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tipo" className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                    <ChevronRight className="mr-2 h-4 w-4" />
                    Tipo de Competencia
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="tipo"
                      checked={tipo === 'idaVuelta'}
                      onCheckedChange={(checked) => setTipo(checked ? 'idaVuelta' : 'ida')}
                      className="bg-black-600 dark:bg-white-600"
                    />
                    <Label htmlFor="tipo" className="cursor-pointer">
                      {tipo === 'ida' ? 'Solo Ida' : 'Ida y Vuelta'}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <Label htmlFor="organizador" className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                    <User className="mr-2 h-4 w-4" />
                    Organizador
                  </Label>
                  <Input
                    id="organizador"
                    value={organizador}
                    onChange={(e) => setOrganizador(e.target.value)}
                    className="bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fechaInicio" className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                    <Calendar className="mr-2 h-4 w-4" />
                    Fecha de Inicio
                  </Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fechaFinal" className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                    <Calendar className="mr-2 h-4 w-4" />
                    Fecha de Fin
                  </Label>
                  <Input
                    id="fechaFinal"
                    type="date"
                    value={fechaFinal}
                    onChange={(e) => setFechaFinal(e.target.value)}
                    className="bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="localizacion" className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                    <MapPin className="mr-2 h-4 w-4" />
                    Localización
                  </Label>
                  <Input
                    id="localizacion"
                    value={localizacion}
                    onChange={(e) => setLocalizacion(e.target.value)}
                    className="bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="imagen" className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                    <Image className="mr-2 h-4 w-4" />
                    Logo del Torneo (Selecciona o arrastra una imagen)
                  </Label>
                  <div
                    className="border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 p-4 rounded-md flex items-center justify-center relative"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    {imagen ? (
                      <img src={URL.createObjectURL(imagen)} alt="Logo del Torneo" className="h-20 w-20 object-cover rounded-md" />
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">Arrastra una imagen o haz clic para seleccionar</p>
                    )}
                    <input
                      id="imagen"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <Label htmlFor="descripcion" className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                    <FileText className="mr-2 h-4 w-4" />
                    Descripción
                  </Label>
                  <textarea
                    id="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={4}
                    className="w-full p-2 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
              <div className="mb-6">
                <Label className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                  <Trophy className="mr-2 h-4 w-4" />
                  Seleccionar Equipos
                </Label>
                <div className="flex items-center mb-4 w-1/4">
                  <Search className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar equipos..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-2">
                  {equiposFiltrados.map((equipo) => (
                    <motion.div
                      key={equipo.id}
                      className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${equiposSeleccionados.some(e => e.id === equipo.id)
                          ? 'bg-red-100 dark:bg-red-700/70 ring-2 ring-red-600 dark:ring-red-500'
                          : 'bg-gray-200 dark:bg-slate-700/50 hover:bg-gray-300 dark:hover:bg-slate-600/50'
                        }`}
                      onClick={() => toggleSeleccionEquipo(equipo)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img src={equipo.escudo} alt={`Logo de ${equipo.nombre}`} className="w-16 h-16 object-contain mb-2" />
                      <span className="text-sm text-center text-gray-800 dark:text-gray-200">{equipo.nombre}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-8">
                  <Label className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                    <Trophy className="mr-2 h-4 w-4" />
                    Seleccionar Patrocinadores
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
                    {patrocinadoresDisponibles.map((patrocinador) => (
                      <motion.div
                        key={patrocinador.id}
                        className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${patrocinadoresSeleccionados.some(p => p.id === patrocinador.id)
                            ? 'bg-red-100 dark:bg-red-700/70 ring-2 ring-red-600 dark:ring-red-500'
                            : 'bg-gray-200 dark:bg-slate-700/50 hover:bg-gray-300 dark:hover:bg-slate-600/50'
                          }`}
                        onClick={() => toggleSeleccionPatrocinador(patrocinador)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img src={patrocinador.logo} alt={`Logo de ${patrocinador.nombre}`} className="w-16 h-16 object-contain mb-2" />
                        <span className="text-sm text-center text-gray-800 dark:text-gray-200">{patrocinador.nombre}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={crearLiga}
                  disabled={isLoading}
                  className="bg-red-700 hover:bg-red-800 text-white dark:bg-red-600 dark:hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creando...
                    </>
                  ) : (
                    <>
                      <Trophy className="mr-2 h-4 w-4" />
                      Crear Liga
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <AnimatePresence>
            {equiposSeleccionados.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-white dark:bg-slate-800 border-red-200 dark:border-red-800 shadow-lg mt-6">
                  <CardHeader>
                    <CardTitle className="text-red-700 dark:text-red-400 flex items-center">
                      <Users className="mr-2 h-6 w-6" />
                      Equipos Seleccionados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {equiposSeleccionados.map((equipo) => (
                        <motion.div
                          key={equipo.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col items-center p-3 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200"
                        >
                          <img src={equipo.escudo} alt={`Logo de ${equipo.nombre}`} className="w-12 h-12 object-contain mb-2" />
                          <span className="text-sm text-center">{equipo.nombre}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  )
}