'use client'

import { useState, useEffect, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Link } from 'react-router-dom'
import { Label } from "@/components/ui/label"
import { ChevronRight, ChevronDown, Calendar, ArrowUpDown, Trophy, PlusCircle, Play, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import config from '../config';
import axiosInstance from '@/contexts/axiosConfig'
import { Check_Validation } from "@/contexts/cheking"

const API_BASE_URL = `${config.API_URL}`

// Types
type Team = {
  id: number
  nombre: string
  escudo: string | null
  marcador?: number
}

type Match = {
  id: string
  nombre: string
  equipo_1: Team | null
  equipo_2: Team | null
  empezado: boolean
  finalizado: boolean
  fecha_inicio: string
  fecha_final: string
  venue?: string
  status?: 'SCHEDULED' | 'LIVE' | 'FINISHED'
}

type Round = {
  nombre: string
  partidos: Match[]
}

type Standing = {
  equipo: string
  puntos: number
  partidos_ganados: number
  partidos_empatados: number
  partidos_perdidos: number
  goles_anotados: number
  goles_recibidos: number
  diferencia_goles: number
}

type Liga = {
  id: number
  nombre: string
  jornada: Round[]
  empezado: boolean
  finalizado: boolean
  fecha_inicio: string
  fecha_final: string
  tipo: string
  equipos: Team[]
  imagen: string
  ganador: Team | null
  clasificacion: Standing[]
  patrocinadores?: { name: string; logo: string; website: string }[]
}


// Function to fetch data from the API
const fetchLiga = async (ligaId: number): Promise<Liga> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/liga/${ligaId}/`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Liga no encontrada. Por favor, verifica el ID de la liga.')
      }
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Error al cargar los datos de la liga')
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching liga:', error)
    throw error instanceof Error ? error : new Error('Error desconocido al cargar la liga')
  }
}

export default function EnhancedLeagueStandings() {
  // States
  const navigate = useNavigate();
  const [expandedMatchday, setExpandedMatchday] = useState<number | null>(null)
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [filterRound, setFilterRound] = useState<string>('all')
  const [sortColumn, setSortColumn] = useState<keyof Standing>('puntos')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ligaData, setLigaData] = useState<Liga | null>(null)
  const { id } = useParams();
  const [validado, setValidado] = useState(false)

  useEffect(() => {
    Check_Validation().then((variable) => {
      console.log(variable)
      setValidado(variable)
    })
  }, [])

  const loadLigaData = async () => {
    try {
      setLoading(true);
      const data = await fetchLiga(Number(id));
      console.log("Liga data:", data);
      console.log("Jornadas:", data.jornada);
      if (data.jornada?.[0]?.partido_set) {
        console.log("Partidos de primera jornada:", data.jornada[0].partido_set);
      }
      setLigaData(data);
    } catch (err) {
      console.error('Error loading liga:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Utility functions with memo for optimization
  const filteredFixtures = useMemo(() => {
    if (!ligaData?.jornada) {
      return [];
    }

    return filterRound === 'all'
      ? ligaData.jornada
      : ligaData.jornada.filter(jornada =>
        jornada.nombre === filterRound
      );
  }, [ligaData, filterRound]);

  const handleDeleteLiga = async () => {
    try {
      const response = await axiosInstance.delete(`/liga/mod/${id}/`);
      navigate('/');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleComenzarLiga = async () => {
    try {
      const data = {
        empezado: true
      }
      console.log('Comenzado liga:', id);
      const response = await axiosInstance.patch(`/liga/mod/${id}/`, data);
      location.reload()
    } catch (error) {
      console.error('Error al comenzar la liga:', error);
    }
  };

  const handleFinalizarLiga = async () => {
    try {
      const data = {
        finalizado: true
      }
      console.log('Finalizando liga:', id);
      const response = await axiosInstance.patch(`/liga/mod/${id}/`, data);
      // Redirigir a la página principal
      navigate('/');
    } catch (error) {
      console.error('Error al finalizar la liga:', error);
    }
  };

  const sortedStandings = useMemo(() => {
    if (!ligaData?.clasificacion) {
      return [];
    }

    return [...ligaData.clasificacion].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [ligaData, sortColumn, sortDirection]);

  // Effect to load data
  useEffect(() => {
    loadLigaData();
  }, [id]);

  // Event handlers
  const handleSort = (column: keyof Standing) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const handleCrearJornada = (jornadaName: string) => {
    // Implement your logic to handle creating a new jornada here
    console.log("Crear Jornada clicked with name:", jornadaName);
  };

  const handleCrearPartido = () => {
    // Implement your logic to handle creating a new match here
    console.log("Crear Partido clicked!");
  };

  const handleIniciarPartido = async (partidoId) => {
    try {
      const data = {
        empezado: "true"
      }
      const response = await axiosInstance.patch(`/partidos/mod/${partidoId}/`, data);
      navigate(`/Consola/${partidoId}/`)

    } catch (error) {
      console.error('Error completo:', error);
    }
    console.log(`Iniciar partido ${partidoId} clicked!`);
  };

  const obtenerToken = async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al obtener el token');
    }

    const data = await response.json();
    localStorage.setItem('token', data.access);
    localStorage.setItem('refreshToken', data.refresh);
    return data.access;
  };

  const CrearJornadaModal = ({ onCrearJornada }) => {
    const [jornadaName, setJornadaName] = useState("Jornada")
    const [isCreating, setIsCreating] = useState(false)
    const [open, setOpen] = useState(false)
    const { id } = useParams<{ id: string }>()

    const handleCrearJornada = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsCreating(true)

      try {
        const data = {
          nombre: jornadaName,
          liga: id
        }
        const response = await axiosInstance.post(`/jornada/create/`, data)
        const newJornada = await response.data
        onCrearJornada(newJornada.nombre)
        setJornadaName("Jornada")
        console.log("La jornada se ha creado correctamente")
        setOpen(false)
        loadLigaData()
      } catch (error) {
        console.error('Error detallado al crear la jornada:', error)
      } finally {
        setIsCreating(false)
      }
    }

    return (
      <>
        {validado && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Crear Jornada
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Jornada</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCrearJornada}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="jornadaName" className="text-right">
                      Nombre
                    </Label>
                    <Input
                      id="jornadaName"
                      value={jornadaName}
                      onChange={(e) => setJornadaName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? 'Creando...' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </>
    )
  }


  const CrearPartidoModal = () => {
    return (
      <>
        {validado && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Crear Partido
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Partido</DialogTitle>
              </DialogHeader>
              <Link to={`/Crear/Partido?ligaId=${id}`}>
                <Button className="w-full">Ir a Crear Partido</Button>
              </Link>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  };

  // Loading and error states
  if (loading) return <div className="flex justify-center items-center min-h-screen">
    <div className="text-xl">Cargando...</div>
  </div>

  if (error) return <div className="flex justify-center items-center min-h-screen">
    <div className="text-xl text-red-500">Error: {error}</div>
  </div>

  if (!ligaData) return null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            className="text-4xl font-bold flex items-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Trophy className="h-8 w-8 text-yellow-500" />
            {ligaData.nombre}
            <span className="text-lg font-normal text-muted-foreground">
              {ligaData?.fecha_inicio?.split('-')[0]}/{parseInt(ligaData?.fecha_inicio?.split('-')[0]) + 1}
            </span>
          </motion.h1>
          <div className="flex gap-2">
            {validado && !ligaData.empezado && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Empezar Liga
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción comenzará la liga y no se podrá revertir.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleComenzarLiga}>Comenzar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {validado && ligaData.empezado && !ligaData.finalizado && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Finalizar Liga
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción finalizará la liga y no se podrá revertir. Se determinará el ganador basado en la clasificación actual.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFinalizarLiga}>Finalizar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {validado && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex items-center">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar Liga
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro que deseas eliminar esta liga?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará permanentemente la liga y todos sus datos asociados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteLiga}>Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Tabs Structure */}
        <Tabs defaultValue="fixtures" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-200 dark:bg-gray-800">
            <TabsTrigger
              value="fixtures"
              className="data-[state=active]:bg-red-500 dark:data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              Partidos
            </TabsTrigger>
            <TabsTrigger
              value="standings"
              className="data-[state=active]:bg-red-500 dark:data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              Clasificación
            </TabsTrigger>
          </TabsList>
          {/* Fixtures Content */}
          <TabsContent value="fixtures">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-red-500" />
                    Calendario de Partidos
                  </div>
                  <div className="flex items-center gap-2">
                    <CrearJornadaModal onCrearJornada={handleCrearJornada} />
                    <CrearPartidoModal onCrearPartido={handleCrearPartido} />
                    <Select value={filterRound} onValueChange={setFilterRound}>
                      <SelectTrigger className="w-[180px] bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                        <SelectValue placeholder="Filtrar por jornada" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las jornadas</SelectItem>
                        {ligaData?.jornada?.map((jornada, index) => (
                          <SelectItem
                            key={index}
                            value={jornada.nombre}
                          >
                            {jornada.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFixtures.map((jornada, index) => (
                    <div key={index} className="border rounded-lg border-gray-200 dark:border-gray-700">
                      <div
                        onClick={() => setExpandedMatchday(expandedMatchday === index ? null : index)}
                        className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <h3 className="font-medium">{jornada.nombre}</h3>
                        {expandedMatchday === index ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </div>

                      {expandedMatchday === index && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                          {jornada.partidos && jornada.partidos.length > 0 ? (
                            jornada.partidos.map((partido, pIndex) => (
                              <div
                                key={partido.id || pIndex}
                                className={`py-3 ${pIndex > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}
                              >
                                <div className="flex items-center justify-between gap-4">
                                  <div className="text-sm text-gray-500 whitespace-nowrap">
                                    {partido.fecha_inicio && new Date(partido.fecha_inicio).toLocaleString('es-ES', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                  <Link to={`/Partido/${partido.id}`}>
                                    <div className="flex-1 flex items-center justify-center gap-4">
                                      <div className="flex items-center gap-2 min-w-[120px] justify-end">
                                        {partido.equipo_1?.escudo && (
                                          <img
                                            src={partido.equipo_1.escudo}
                                            alt={partido.equipo_1.nombre}
                                            className="w-8 h-8 object-contain"
                                          />
                                        )}
                                        <span className="font-medium">{partido.equipo_1?.nombre}</span>
                                      </div>
                                      <div className="flex items-center justify-center min-w-[60px]">
                                        {partido.empezado ? (
                                          <span className="font-bold">
                                            {partido.equipo_1?.marcador || 0} - {partido.equipo_2?.marcador || 0}
                                          </span>
                                        ) : (
                                          <span className="text-sm text-gray-500">vs</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 min-w-[120px]">
                                        <span className="font-medium">{partido.equipo_2?.nombre}</span>
                                        {partido.equipo_2?.escudo && (
                                          <img
                                            src={partido.equipo_2.escudo}
                                            alt={partido.equipo_2.nombre}
                                            className="w-8 h-8 object-contain"
                                          />
                                        )}
                                      </div>
                                    </div>
                                  </Link>
                                  <div>
                                    {partido.finalizado ? (
                                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                        FINAL
                                      </span>
                                    ) : partido.empezado ? (
                                      <div className='flex'>
                                        {validado && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleIniciarPartido(partido.id)}
                                            className="flex items-center gap-1"
                                          >
                                            <Play className="h-3 w-3" />
                                            Continuar en consola
                                          </Button>
                                        )}
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-red-500 text-white animate-pulse">
                                          EN VIVO
                                        </span>
                                      </div>
                                    ) : (
                                      <>
                                        {validado && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleIniciarPartido(partido.id)}
                                            className="flex items-center gap-1"
                                          >
                                            <Play className="h-3 w-3" />
                                            Iniciar partido
                                          </Button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-gray-500 py-4">
                              No hay partidos programados para esta jornada
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Standings Content */}
          <TabsContent value="standings">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Tabla de Posiciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 dark:border-gray-800">
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Equipo</TableHead>
                        <TableHead className="text-center cursor-pointer" onClick={() => handleSort('partidos_ganados')}>
                          <div className="flex items-center justify-center">
                            PJ
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="text-center cursor-pointer" onClick={() => handleSort('partidos_ganados')}>
                          <div className="flex items-center justify-center">
                            G
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="text-center cursor-pointer" onClick={() => handleSort('partidos_empatados')}>
                          <div className="flex items-center justify-center">
                            E
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="text-center cursor-pointer" onClick={() => handleSort('partidos_perdidos')}>
                          <div className="flex items-center justify-center">
                            P
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="text-center cursor-pointer" onClick={() => handleSort('goles_anotados')}>
                          <div className="flex items-center justify-center">
                            GF
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="text-center cursor-pointer" onClick={() => handleSort('goles_recibidos')}>
                          <div className="flex items-center justify-center">
                            GC
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="text-center cursor-pointer" onClick={() => handleSort('puntos')}>
                          <div className="flex items-center justify-center">
                            PTS
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedStandings.map((team, index) => (
                        <TableRow
                          key={team.equipo}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 border-gray-200 dark:border-gray-800"
                        >
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <Link to={`/Equipo/${team.id}`}>
                              <div className="flex items-center gap-2">
                                {team.equipo}
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell className="text-center">{team.partidos_ganados + team.partidos_empatados + team.partidos_perdidos}</TableCell>
                          <TableCell className="text-center">{team.partidos_ganados}</TableCell>
                          <TableCell className="text-center">{team.partidos_empatados}</TableCell>
                          <TableCell className="text-center">{team.partidos_perdidos}</TableCell>
                          <TableCell className="text-center">{team.goles_anotados}</TableCell>
                          <TableCell className="text-center">{team.goles_recibidos}</TableCell>
                          <TableCell className="text-center font-bold">{team.puntos}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* patrocinadores Section */}
        <Card className="mt-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Patrocinadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {ligaData.patrocinadores?.map((patrocinador) => (
                <a
                  key={patrocinador.nombre}
                  href={patrocinador.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105"
                >
                  <img
                    src={patrocinador.logo}
                    alt={`${patrocinador.nombre} logo`}
                    className="h-12 object-contain"
                  />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}