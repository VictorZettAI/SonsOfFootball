"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Users, Trophy, Search, Calendar, User, MapPin, Image, FileText, Briefcase } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'
import config from '../config';
import axiosInstance from '@/contexts/axiosConfig'


type Equipo = {
  id: number
  nombre: string
  logo: string
}

type Patrocinador = {
  id: number
  nombre: string
  logo: string
}

type Partido = {
  id: string
  equipo1: Equipo | null
  equipo2: Equipo | null
  resultado1: string
  resultado2: string
}

type Ronda = {
  nombre: string
  partidos: Partido[]
}



export default function CrearTorneo() {
  const navigate = useNavigate();
  const [cantidadTotalEquipos, setCantidadTotalEquipos] = useState(16)
  const [equiposSeleccionados, setEquiposSeleccionados] = useState<Equipo[]>([])
  const [equiposDisponibles, setEquiposDisponibles] = useState<Equipo[]>([]) // Añade esta línea
  const [equiposDisponiblesBD, setEquiposDisponiblesBD] = useState<Equipo[]>([])
  const [patrocinadoresDisponibles, setPatrocinadoresDisponibles] = useState<Patrocinador[]>([])
  const [patrocinadoresSeleccionados, setPatrocinadoresSeleccionados] = useState<Patrocinador[]>([])
  const [bracket, setBracket] = useState<Ronda[]>([])
  const [nombreTorneo, setNombreTorneo] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [localizacion, setLocalizacion] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [logoTorneo, setLogoTorneo] = useState()
  const [organizador, setOrganizador] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Modifica useEffect para cargar también los patrocinadores

  useEffect(() => {
    cargarEquipos()
    cargarPatrocinadores()
  }, [])
  // Añade esta función


  // En el JSX, reemplaza patrocinadoresPreregistrados por patrocinadoresDisponibles




  useEffect(() => {
    inicializarBracket()
  }, [cantidadTotalEquipos, equiposSeleccionados])

  useEffect(() => {
    setEquiposDisponibles([...equiposSeleccionados])
  }, [equiposSeleccionados])

  const inicializarBracket = () => {
    const rondas: Ronda[] = []

    if (cantidadTotalEquipos >= 17 && cantidadTotalEquipos <= 32) {
      rondas.push({
        nombre: "Dieciseisavos de Final",
        partidos: Array(16).fill(null).map((_, i) => ({
          id: `dieciseisavos-${i}`,
          equipo1: null,
          equipo2: null,
          resultado1: "",
          resultado2: "",
        }))
      })

      rondas.push({
        nombre: "Octavos de Final",
        partidos: Array(8).fill(null).map((_, i) => ({
          id: `octavos-${i}`,
          equipo1: null,
          equipo2: null,
          resultado1: "",
          resultado2: "",
        }))
      })
    } else if (cantidadTotalEquipos >= 9 && cantidadTotalEquipos <= 16) {
      rondas.push({
        nombre: "Octavos de Final",
        partidos: Array(8).fill(null).map((_, i) => ({
          id: `octavos-${i}`,
          equipo1: null,
          equipo2: null,
          resultado1: "",
          resultado2: "",
        }))
      })
    }

    if (cantidadTotalEquipos >= 5) {
      rondas.push({
        nombre: "Cuartos de Final",
        partidos: Array(4).fill(null).map((_, i) => ({
          id: `cuartos-${i}`,
          equipo1: null,
          equipo2: null,
          resultado1: "",
          resultado2: "",
        }))
      })
    }

    rondas.push({
      nombre: "Semifinales",
      partidos: Array(2).fill(null).map((_, i) => ({
        id: `semifinal-${i}`,
        equipo1: null,
        equipo2: null,
        resultado1: "",
        resultado2: "",
      }))
    })

    rondas.push({
      nombre: "Tercer y Cuarto Puesto",
      partidos: [{
        id: "tercer-puesto",
        equipo1: null,
        equipo2: null,
        resultado1: "",
        resultado2: "",
      }]
    })

    rondas.push({
      nombre: "Final",
      partidos: [{
        id: "final",
        equipo1: null,
        equipo2: null,
        resultado1: "",
        resultado2: "",
      }]
    })

    setBracket(rondas)
  }

  const cargarEquipos = async () => {
    try {
      const response = await fetch(`${config.API_URL}/equipo/lista/`)
      if (!response.ok) throw new Error('Error al cargar equipos')
      const data = await response.json()
      setEquiposDisponiblesBD(data.map((equipo: any) => ({
        id: equipo.id,
        nombre: equipo.nombre,
        logo: equipo.escudo || '/placeholder.png'
      })))
    } catch (error) {
      console.error('Error cargando equipos:', error)
      toast.error('Error al cargar los equipos')
    }
  }
  const cargarPatrocinadores = async () => {
    try {
      const response = await fetch(`${config.API_URL}/patrocinador/`)
      if (!response.ok) throw new Error('Error al cargar patrocinadores')
      const data = await response.json()
      setPatrocinadoresDisponibles(data.map((patrocinador: any) => ({
        id: patrocinador.id,
        nombre: patrocinador.nombre,
        logo: patrocinador.logo ?? '/placeholder.png'  // Cambiar || por ??
      })))
    } catch (error) {
      console.error('Error cargando patrocinadores:', error)
      toast.error('Error al cargar los patrocinadores')
    }
  }

  const actualizarPartido = (rondaIndex: number, partidoIndex: number, campo: string, valor: any) => {
    setBracket(prevBracket => {
      const newBracket = [...prevBracket]
      const partido = { ...newBracket[rondaIndex].partidos[partidoIndex] }

      if (campo === 'equipo1' || campo === 'equipo2') {
        const equipoAnterior = partido[campo]
        if (equipoAnterior) {
          setEquiposDisponibles(prev => [...prev, equipoAnterior])
        }
        partido[campo] = valor
        if (valor) {
          setEquiposDisponibles(prev => prev.filter(e => e.id !== valor.id))
        }
      } else if (campo === 'resultado1' || campo === 'resultado2') {
        partido[campo] = valor
      }

      newBracket[rondaIndex].partidos[partidoIndex] = partido
      return newBracket
    })
  }

  const toggleSeleccionEquipo = (equipo: Equipo) => {
    if (equiposSeleccionados.some(e => e.id === equipo.id)) {
      setEquiposSeleccionados(equiposSeleccionados.filter(e => e.id !== equipo.id))
    } else if (equiposSeleccionados.length < cantidadTotalEquipos) {
      setEquiposSeleccionados([...equiposSeleccionados, equipo])
    } else {
      toast.error(`Ya has seleccionado el máximo de ${cantidadTotalEquipos} equipos`)
    }
  }

  const toggleSeleccionPatrocinador = (patrocinador: Patrocinador) => {
    if (patrocinadoresSeleccionados.some(p => p.id === patrocinador.id)) {
      setPatrocinadoresSeleccionados(patrocinadoresSeleccionados.filter(p => p.id !== patrocinador.id))
    } else {
      setPatrocinadoresSeleccionados([...patrocinadoresSeleccionados, patrocinador])
    }
  }

  const guardarConfiguracion = async () => {
    if (!nombreTorneo) {
      toast.error('El nombre del torneo es obligatorio')
      return
    }

    if (equiposSeleccionados.length !== cantidadTotalEquipos) {
      toast.error(`Debes seleccionar exactamente ${cantidadTotalEquipos} equipos`)
      return
    }

    setIsLoading(true)

    try {
      const torneoData = {
        nombre: nombreTorneo,
        descripcion: descripcion,
        localizacion: localizacion,
        organizador: organizador,
        fecha_inicio: fechaInicio ? `${fechaInicio}T00:00:00Z` : null,
        fecha_final: fechaFin ? `${fechaFin}T00:00:00Z` : null,
        empezado: false,
        patrocinadores: patrocinadoresSeleccionados.map(p => p.id),
        bracket: {
          equipo: equiposSeleccionados.map(e => e.id),
          fecha_inicio: fechaInicio ? `${fechaInicio}T00:00:00Z` : null,
          fecha_final: fechaFin ? `${fechaFin}T00:00:00Z` : null,
          empezado: false,
          finales: false
        }
      }

      const response = await axiosInstance.post(`/torneo/nuevo/`, torneoData)
      const data = await response.data

      if (logoTorneo instanceof File) {
        const formData = new FormData()
        formData.append('imagen', logoTorneo)
        await axiosInstance.patch(`/torneo/mod/${data.id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      }

      toast.success('Torneo creado exitosamente')

      setNombreTorneo('')
      setDescripcion('')
      setEquiposSeleccionados([])
      setPatrocinadoresSeleccionados([])
      setFechaInicio('')
      setFechaFin('')
      setLocalizacion('')
      setOrganizador('')
      setLogoTorneo('')
      setBracket([])
      setCantidadTotalEquipos(16)
      navigate(`/Torneo/${data.id}/`)

    }
    catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear el torneo')
    }
    finally {
      setIsLoading(false)
    }
  }

  const equiposFiltrados = equiposDisponiblesBD.filter(equipo =>
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
                <Trophy className="mr-2 h-6 w-6" />
                Configuración del Torneo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div>
                  <Label htmlFor="cantidadTotalEquipos" className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                    <Users className="mr-2 h-4 w-4" />
                    Cantidad Total de Equipos
                  </Label>
                  <Select value={cantidadTotalEquipos.toString()} onValueChange={(value) => setCantidadTotalEquipos(Number(value))}>
                    <SelectTrigger id="cantidadTotalEquipos" className="w-full bg-gray-50 dark:bg-slate-700 text-red-700 dark:text-red-400 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Seleccionar cantidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nombreTorneo" className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                    <Trophy className="mr-2 h-4 w-4" />
                    Nombre del Torneo
                  </Label>
                  <Input
                    id="nombreTorneo"
                    value={nombreTorneo}
                    onChange={(e) => setNombreTorneo(e.target.value)}
                    className="bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                  />
                </div>
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
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                  />
                </div>
                <div>
                  <Label htmlFor="fechaFin" className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                    <Calendar className="mr-2 h-4 w-4" />
                    Fecha de Fin
                  </Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
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
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="logoTorneo" className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                    <Image className="mr-2 h-4 w-4" />
                    Logo del Torneo
                  </Label>
                  <Input
                    id="logoTorneo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoTorneo(file);
                      }
                    }}
                    className="bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                  />
                  {logoTorneo && (
                    <img src={URL.createObjectURL(logoTorneo)} alt="Logo del Torneo" className="mt-2 h-20 w-20 object-contain" />
                  )}
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
                      <img src={equipo.logo} alt={`Logo de ${equipo.nombre}`} className="w-16 h-16 object-contain mb-2" />
                      <span className="text-sm text-center text-gray-800 dark:text-gray-200">{equipo.nombre}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <Label className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                  <Briefcase className="mr-2 h-4 w-4" />
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

              <div className="flex justify-center">
                <Button
                  onClick={guardarConfiguracion}
                  className="bg-red-700 hover:bg-red-800 text-white dark:bg-red-600 dark:hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      Guardar Configuración
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

        </motion.div>
      </main>

      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  )
}