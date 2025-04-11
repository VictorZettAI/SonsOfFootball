"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Save, Users, Trophy, Grid, Plus, X, Calendar, User, MapPin, Image, FileText, Briefcase } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'
import config from '../config';
import axiosInstance from '@/contexts/axiosConfig'

interface Equipo {
  id: number;
  nombre: string;
  logo: string;
  enGrupo?: boolean;
}

interface Grupo {
  id: string;
  equipos: Equipo[];
}

type Patrocinador = {
  id: number
  nombre: string
  logo: string
}



export default function CreadorTorneo() {
  const navigate = useNavigate();
  const [cantidadTotalEquipos, setCantidadTotalEquipos] = useState(16)
  const [cantidadGrupos, setCantidadGrupos] = useState(4)
  const [equiposPorGrupo, setEquiposPorGrupo] = useState(4)
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [equiposSeleccionados, setEquiposSeleccionados] = useState<Equipo[]>([])
  const [nuevoGrupoId, setNuevoGrupoId] = useState('')
  const [nombreTorneo, setNombreTorneo] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [localizacion, setLocalizacion] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [logoTorneo, setLogoTorneo] = useState('')
  const [organizador, setOrganizador] = useState('')
  const [equiposDisponiblesBD, setEquiposDisponiblesBD] = useState<Equipo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [patrocinadoresSeleccionados, setPatrocinadoresSeleccionados] = useState<Patrocinador[]>([])
  const [patrocinadoresDisponibles, setPatrocinadoresDisponibles] = useState<Patrocinador[]>([])

  const actualizarCantidadGrupos = (cantidad: number) => {
    setCantidadGrupos(cantidad)
    const nuevoEquiposPorGrupo = Math.min(Math.floor(cantidadTotalEquipos / cantidad), 10)
    setEquiposPorGrupo(nuevoEquiposPorGrupo)
    setCantidadTotalEquipos(cantidad * nuevoEquiposPorGrupo)
  }

  const actualizarEquiposPorGrupo = (cantidad: number) => {
    setEquiposPorGrupo(cantidad)
    setCantidadTotalEquipos(cantidadGrupos * cantidad)
  }

  const removerEquipo = (equipoId: number) => {
    const equipoEnGrupo = grupos.some(grupo => grupo.equipos.some(e => e.id === equipoId));
    if (equipoEnGrupo) {
      toast.error('No puedes deseleccionar un equipo que está asignado a un grupo');
      return;
    }
    setEquiposSeleccionados(equiposSeleccionados.filter(e => e.id !== equipoId));
  };

  const guardarConfiguracion = async () => {
    const gruposIncompletos = grupos.some(grupo => grupo.equipos.length !== equiposPorGrupo);
    if (gruposIncompletos) {
      toast.error('Todos los grupos deben tener el número correcto de equipos');
      return;
    }

    if (!nombreTorneo) {
      toast.error('El nombre del torneo es obligatorio');
      return;
    }

    if (equiposSeleccionados.length !== cantidadTotalEquipos) {
      toast.error(`Debes seleccionar exactamente ${cantidadTotalEquipos} equipos`);
      return;
    }

    setIsLoading(true);

    try {
      const todosLosEquiposIds = grupos.reduce((ids: number[], grupo) => (
        [...ids, ...grupo.equipos.map(e => e.id)]
      ), []);

      const torneoData: any = {
        nombre: nombreTorneo,
        descripcion: descripcion,
        localizacion: localizacion,
        organizador: organizador,
        patrocinadores: patrocinadoresSeleccionados.map(p => p.id),
        empezado: false,
        equipos: todosLosEquiposIds,
        champions: {
          empezado: false,
          liga_v2: {
            nota_corte: 2,
            empezado: false,
            equipos: todosLosEquiposIds,
            grupo: grupos.map(grupo => ({
              nombre: grupo.id,
              equipos: grupo.equipos.map(e => e.id)
            }))
          }
        }
      };

      if (fechaInicio) {
        torneoData.fecha_inicio = `${fechaInicio}T00:00:00Z`;
        torneoData.champions.fecha_inicio = `${fechaInicio}T00:00:00Z`;
      }

      if (fechaFin) {
        torneoData.fecha_final = `${fechaFin}T00:00:00Z`;
        torneoData.champions.fecha_final = `${fechaFin}T00:00:00Z`;
      }

      console.log('Datos a enviar:', JSON.stringify(torneoData, null, 2));

      const response = await axiosInstance.post(`/torneo/nuevo/`, torneoData);

      const data = await response.data;
      console.log('Respuesta del servidor:', data);

      if (logoTorneo && logoTorneo instanceof File) {
        const formData = new FormData();
        console.log('FormData:', formData, 'File:', logoTorneo); // Aquí
        formData.append('imagen', logoTorneo);

        const imageResponse = await axiosInstance.patch(`/torneo/mod/${data.id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

      }
      navigate(`/Champions/${data.id}/`)
      toast.success('Torneo creado exitosamente');
      resetForm();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al crear el torneo');
    } finally {
      setIsLoading(false);
    }
  };
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoTorneo(file); // Guarda el archivo directamente
    }
  };

  const resetForm = () => {
    setNombreTorneo('')
    setDescripcion('')
    setEquiposSeleccionados([])
    setPatrocinadoresSeleccionados([])
    setFechaInicio('')
    setFechaFin('')
    setLocalizacion('')
    setOrganizador('')
    setLogoTorneo('')
    setGrupos([])
    setCantidadTotalEquipos(16)
    setCantidadGrupos(4)
    setEquiposPorGrupo(4)
  }

  const eliminarGrupo = (grupoId: string) => {
    setGrupos(prevGrupos => prevGrupos.filter(grupo => grupo.id !== grupoId));
  };

  const crearGrupo = () => {
    if (!nuevoGrupoId.trim()) {
      toast.error('Debes ingresar un nombre para el grupo');
      return;
    }
    if (grupos.some(g => g.id === nuevoGrupoId)) {
      toast.error('Ya existe un grupo con ese nombre');
      return;
    }
    const nuevosGrupos = [...grupos, { id: nuevoGrupoId, equipos: [] }];
    setGrupos(nuevosGrupos);
    setNuevoGrupoId('');
  };

  const agregarEquipoAGrupo = (equipoId: number, grupoId: string) => {
    const equipo = equiposSeleccionados.find(e => e.id === equipoId);
    if (!equipo) return;

    const grupoActual = grupos.find(g => g.id === grupoId);
    if (!grupoActual) return;

    if (grupoActual.equipos.length >= equiposPorGrupo) {
      toast.error(`El Grupo ${grupoId} ya tiene el máximo de ${equiposPorGrupo} equipos`);
      return;
    }

    setGrupos(prevGrupos =>
      prevGrupos.map(grupo =>
        grupo.id === grupoId
          ? { ...grupo, equipos: [...grupo.equipos, equipo] }
          : grupo
      )
    );
  };


  useEffect(() => {
    cargarEquipos()
    cargarPatrocinadores()
  }, [])

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
        logo: patrocinador.logo ?? '/placeholder.png'
      })))
    } catch (error) {
      console.error('Error cargando patrocinadores:', error)
      toast.error('Error al cargar los patrocinadores')
    }
  }

  const seleccionarEquipo = (equipoId: number) => {
    const equipo = equiposDisponiblesBD.find(e => e.id === equipoId);
    if (!equipo) return;

    const equipoEnGrupo = grupos.some(grupo => grupo.equipos.some(e => e.id === equipoId));
    if (equipoEnGrupo) {
      toast.error('No puedes deseleccionar un equipo que está asignado a un grupo');
      return;
    }

    setEquiposSeleccionados(prev =>
      prev.some(e => e.id === equipoId)
        ? prev.filter(e => e.id !== equipoId)
        : prev.length < cantidadTotalEquipos
          ? [...prev, equipo]
          : prev
    );
  };

  const removerEquipoDeGrupo = (equipoId: number, grupoId: string) => {
    const grupoActual = grupos.find(g => g.id === grupoId);
    if (!grupoActual) return;

    setGrupos(prev =>
      prev.map(grupo =>
        grupo.id === grupoId
          ? { ...grupo, equipos: grupo.equipos.filter(e => e.id !== equipoId) }
          : grupo
      )
    );
  };

  const toggleSeleccionPatrocinador = (patrocinador: Patrocinador) => {
    if (patrocinadoresSeleccionados.some(p => p.id === patrocinador.id)) {
      setPatrocinadoresSeleccionados(patrocinadoresSeleccionados.filter(p => p.id !== patrocinador.id))
    } else {
      setPatrocinadoresSeleccionados([...patrocinadoresSeleccionados, patrocinador])
    }
  }

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
                <Grid className="mr-2 h-6 w-6" />
                Configuración del Torneo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                      {Array.from({ length: 79 }, (_, i) => i + 2).map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cantidadGrupos" className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                    <Grid className="mr-2 h-4 w-4" />
                    Cantidad de Grupos
                  </Label>
                  <Select value={cantidadGrupos.toString()} onValueChange={(value) => actualizarCantidadGrupos(Number(value))}>
                    <SelectTrigger id="cantidadGrupos" className="w-full bg-gray-50 dark:bg-slate-700 text-red-700 dark:text-red-400 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Seleccionar cantidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="equiposPorGrupo" className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                    <Users className="mr-2 h-4 w-4" />
                    Equipos por Grupo
                  </Label>
                  <Select value={equiposPorGrupo.toString()} onValueChange={(value) => setEquiposPorGrupo(Number(value))}>
                    <SelectTrigger id="equiposPorGrupo" className="w-full bg-gray-50 dark:bg-slate-700 text-red-700 dark:text-red-400 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Seleccionar cantidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
                    onChange={handleLogoChange} // Usar la nueva función
                    className="bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                  />
                  {logoTorneo && (
                    <img
                      src={logoTorneo instanceof File ? URL.createObjectURL(logoTorneo) : logoTorneo}
                      alt="Logo del Torneo"
                      className="mt-2 h-20 w-20 object-contain"
                    />
                  )}
                </div>
                <div>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-2">
                  {equiposDisponiblesBD.map((equipo) => (
                    <motion.div
                      key={equipo.id}
                      className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${equiposSeleccionados.some(e => e.id === equipo.id)
                          ? 'bg-red-100 dark:bg-red-700/70 ring-2 ring-red-600 dark:ring-red-500'
                          : 'bg-gray-200 dark:bg-slate-700/50 hover:bg-gray-300 dark:hover:bg-slate-600/50'
                        }`}
                      onClick={() => {
                        const equipoEnGrupo = grupos.some(grupo => grupo.equipos.some(e => e.id === equipo.id));
                        if (equiposSeleccionados.some(e => e.id === equipo.id)) {
                          if (equipoEnGrupo) {
                            toast.error('No puedes deseleccionar un equipo que está asignado a un grupo');
                            return;
                          }
                          removerEquipo(equipo.id);
                        } else {
                          seleccionarEquipo(equipo.id);
                        }
                      }}
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

              <div className="mt-6">
                <Label htmlFor="nuevoGrupoId" className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Nuevo Grupo
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="nuevoGrupoId"
                    value={nuevoGrupoId}
                    onChange={(e) => setNuevoGrupoId(e.target.value)}
                    placeholder="Nombre del grupo"
                    className="bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                  <Button onClick={crearGrupo} className="bg-red-700 hover:bg-red-800 text-white dark:bg-red-600 dark:hover:bg-red-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Grupo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <AnimatePresence>
  {grupos.length > 0 && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white dark:bg-slate-800 border-red-200 dark:border-red-800 shadow-lg mt-6">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-400 flex items-center">
            <Trophy className="mr-2 h-6 w-6" />
            Grupos Formados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grupos.map((grupo) => (
              <Card key={grupo.id} className="bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-gray-600 shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-red-700 dark:text-red-400 text-lg">Grupo {grupo.id}</CardTitle>
                    <Button
                      onClick={() => eliminarGrupo(grupo.id)}
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {grupo.equipos.length >= equiposPorGrupo && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      Grupo lleno
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="list-none text-gray-700 dark:text-gray-300">
                    {grupo.equipos.map((equipo) => (
                      <motion.li
                        key={equipo.id}
                        className="flex items-center justify-between mb-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center">
                          <img src={equipo.logo} alt={`Logo de ${equipo.nombre}`} className="w-8 h-8 object-contain mr-2" />
                          <span>{equipo.nombre}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removerEquipoDeGrupo(equipo.id, grupo.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.li>
                    ))}
                  </ul>
                  {grupo.equipos.length < equiposPorGrupo && (
                    <Select onValueChange={(value) => agregarEquipoAGrupo(Number(value), grupo.id)}>
                      <SelectTrigger className="w-full mt-2 bg-white dark:bg-slate-600 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-500">
                        <SelectValue placeholder="Agregar equipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {equiposSeleccionados
                          .filter(equipo => !grupos.some(g => g.equipos.some(e => e.id === equipo.id)))
                          .map(equipo => (
                            <SelectItem key={equipo.id} value={equipo.id.toString()}>
                              {equipo.nombre}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )}
</AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 shadow-md mt-6">
              <CardContent className="flex justify-end pt-6">
                <Button
                  onClick={guardarConfiguracion}
                  disabled={isLoading}
                  className="bg-red-700 hover:bg-red-800 text-white dark:bg-red-600 dark:hover:bg-red-700 flex items-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="mr-2 h-5 w-5" />
                  )}
                  {isLoading ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
      <ToastContainer position="bottom-right" />
    </div>
  )
}
