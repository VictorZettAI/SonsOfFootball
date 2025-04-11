'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import config from '../config';
import { Check_Validation } from "@/contexts/cheking"
import {
  Calendar,
  Trophy,
  Users,
  Flag,
  MapPin,
  ChevronRight,
  Search,
  Plus,
  Star,
  Shield,
  Clock,
  Trash2,
  Edit
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Interfaces basadas en tu API
interface Equipo {
  id: number;
  nombre: string;
  escudo: string | null;
  poblacion: string;
  partido: Partido[];
  jugador: {
    portero: Jugador[];
    defensa: Jugador[];
    medio: Jugador[];
    delantero: Jugador[];
  };
  evento: Evento[];
}

interface Partido {
  id: number;
  nombre: string;
  equipo_1: {
    id: number;
    nombre: string;
    escudo: string | null;
    marcador: number;
  };
  equipo_2: {
    id: number;
    nombre: string;
    escudo: string | null;
    marcador: number;
  };
  localizacion: string | null;
  gran_evento: string | null;
  fecha: string;
  hora: string;
}

interface Jugador {
  id: number;
  nombre: string;
  edad: number;
  nacionalidad: string;
  posicion: string;
  numero: number;
  vacio: boolean;
  equipo: number;
}

interface Evento {
  id: number;
  fecha_inicio: string;
  partidos: number;
  ganador: number;
  puntuacion: number;
}

// Custom hook para obtener datos del equipo
const useEquipoData = (equipoId: number) => {
  const [equipoData, setEquipoData] = useState<Equipo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquipoData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${config.API_URL}/equipo/${equipoId}/`);
        if (!response.ok) {
          throw new Error('Error al cargar los datos del equipo');
        }
        const data = await response.json();
        setEquipoData(data);
        console.log(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEquipoData();
  }, [equipoId]);

  return { equipoData, isLoading, error };
};

export default function InfoEquipo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [hoveredMatch, setHoveredMatch] = useState<number | null>(null);
  const [hoveredPlayer, setHoveredPlayer] = useState<number | null>(null);
  const { equipoData, isLoading, error } = useEquipoData(id); // Asumiendo que queremos cargar el equipo con ID 2
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [validado, setValidado] = useState(false)

  useEffect(() => {
    Check_Validation().then((variable) => {
      console.log(variable)
      setValidado(variable)
    })
  }, [])

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-red-500/20 rounded-full animate-ping" />
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-red-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );

  }

  const loadAllMatches = () => {
    setShowAllMatches(true);
  };

  const loadAllEvents = () => {
    setShowAllEvents(true);
  }

  const handleDelete = async () => {
    // Implement the delete logic here
    console.log('Deleting team...')
    // After successful deletion, navigate to the teams list page
    navigate('/equipos')
  }

  const calculateStats = () => {
    if (!equipoData) return { matches: 0, wins: 0, goals: 0 };

    const totalMatches = equipoData.partido.length;
    const wins = equipoData.partido.filter(partido =>
      (partido.equipo_1.id === equipoData.id && partido.equipo_1.marcador > partido.equipo_2.marcador) ||
      (partido.equipo_2.id === equipoData.id && partido.equipo_2.marcador > partido.equipo_1.marcador)
    ).length;

    const goals = equipoData.partido.reduce((total, partido) => {
      if (partido.equipo_1.id === equipoData.id) {
        return total + partido.equipo_1.marcador;
      } else {
        return total + partido.equipo_2.marcador;
      }
    }, 0);

    return { matches: totalMatches, wins, goals };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-blue-500/10 dark:from-red-500/5 dark:to-blue-500/5" />
            <div className="relative p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <div className="relative w-40 h-40 transition-transform duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-blue-500 rounded-full animate-pulse opacity-20" />
                  <img
                    src={equipoData?.escudo || "/placeholder.svg?height=160&width=160"}
                    alt={equipoData?.nombre || "Equipo"}
                    width={160}
                    height={160}
                    className="rounded-full"
                  />
                </div>
                <div className="text-center md:text-left flex-grow">
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center md:justify-start">
                    {equipoData?.nombre || "Cargando..."}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 flex items-center justify-center md:justify-start">
                    <MapPin className="h-4 w-4 mr-1" />
                    {equipoData?.poblacion || "Ubicación no disponible"}
                  </p>

                  <div className="grid grid-cols-3 gap-4 max-w-md">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-start justify-start mb-2">
                        <Trophy className="h-6 w-6 text-red-500" />
                      </div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.matches}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Partidos</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-emerald-50 dark:from-red-500/10 dark:to-emerald-500/10 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center justify-left mb-2">
                        <Star className="h-6 w-6 text-red-500" />
                      </div>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.wins}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Victorias</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-start justify-start mb-2">
                        <Shield className="h-6 w-6 text-blue-500" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.goals}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Goles</p>
                    </div>
                  </div>
                </div>
                {validado && (
                  <div className="self-start">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="flex items-center">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro que deseas eliminar este equipo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el equipo y todos sus datos asociados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="h-6 w-6 text-red-500" />
              Eventos Recientes
            </h2>
          </div>

          {equipoData?.evento.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No hay eventos registrados
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(showAllEvents ? equipoData?.evento : equipoData?.evento.slice(0, 3)).map((evento) => (
                <div
                  key={evento.id}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-blue-500/5 rounded-lg transform transition-transform duration-300 group-hover:scale-105 opacity-0 group-hover:opacity-100" />
                  <Card className="relative bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-110">
                            <Calendar className="h-8 w-8 text-red-500" />
                          </div>
                          <div>
                            <p>{evento.nombre}</p>
                          </div>
                          <div>
                            <CardTitle className="text-lg text-slate-900 dark:text-white group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-300">
                              {new Date(evento.fecha_inicio).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'numeric'
                              })}
                            </CardTitle>
                          </div>
                        </div>
                        {evento.ganador === equipoData.id && (
                          <Badge
                            className="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                          >
                            Ganador
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 transition-colors duration-300 group-hover:bg-red-50 dark:group-hover:bg-red-500/10">
                          <p className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                            {evento.partidos}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Partidos</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 transition-colors duration-300 group-hover:bg-red-50 dark:group-hover:bg-red-500/10">
                          <p className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                            {evento.ganador}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Victorias</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 transition-colors duration-300 group-hover:bg-red-50 dark:group-hover:bg-red-500/10">
                          <p className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                            {evento.puntuacion}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Puntos</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardContent>
                      <Link to={`/${evento.tipo_event}/${evento.id}/`}>
                        <Button
                          variant="outline"
                          className="w-full group-hover:bg-red-50 group-hover:text-red-600 dark:group-hover:bg-red-500/10 dark:group-hover:text-red-400 transition-colors duration-300"
                        >
                          Ver Detalles
                          <ChevronRight className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {!showAllEvents && equipoData?.evento.length > 3 && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                className="relative overflow-hidden group hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors duration-300"
                onClick={loadAllEvents}
              >
                <span className="relative z-10">
                  Ver Todos los Eventos
                </span>
                <div
                  className="absolute inset-0 bg-red-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10"
                />
              </Button>
            </div>
          )}
        </section>
        {/* Recent Matches */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-6 w-6 text-red-500" />
              Partidos Recientes
            </h2>
          </div>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {(showAllMatches ? equipoData?.partido : equipoData?.partido.slice(0, 3)).map((partido, index) => {
                  const isLocalTeam = partido.equipo_1.id === equipoData.id;
                  const localScore = partido.equipo_1.marcador;
                  const visitorScore = partido.equipo_2.marcador;
                  const result = isLocalTeam ?
                    (localScore > visitorScore ? 'W' : localScore < visitorScore ? 'L' : 'D') :
                    (visitorScore > localScore ? 'W' : visitorScore < localScore ? 'L' : 'D');

                  return (
                    <div
                      key={partido.id}
                      className="relative group"
                      onMouseEnter={() => setHoveredMatch(index)}
                      onMouseLeave={() => setHoveredMatch(null)}
                    >
                      <div
                        className="absolute left-0 top-0 h-full w-1 bg-transparent transition-colors duration-300"
                        style={{
                          backgroundColor: hoveredMatch === index ? 'rgb(34 197 94)' : 'transparent'
                        }}
                      />
                      <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-4">
                              <div className="relative w-12 h-12 transition-transform duration-300 hover:scale-110">
                                <img
                                  src={partido.equipo_1.escudo || "/placeholder.svg?height=48&width=48"}
                                  alt={partido.equipo_1.nombre}
                                  width={48}
                                  height={48}
                                  className="rounded-full"
                                />
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-slate-600 dark:text-slate-400 font-medium">vs</span>
                                <div className="h-px w-8 bg-slate-200 dark:bg-slate-700" />
                              </div>
                              <div className="relative w-12 h-12 transition-transform duration-300 hover:scale-110">
                                <img
                                  src={partido.equipo_2.escudo || "/placeholder.svg?height=48&width=48"}
                                  alt={partido.equipo_2.nombre}
                                  width={48}
                                  height={48}
                                  className="rounded-full"
                                />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-slate-900 dark:text-white group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-300">
                                {partido.equipo_1.nombre} vs {partido.equipo_2.nombre}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs group-hover:bg-red-50 group-hover:text-red-600 dark:group-hover:bg-red-500/10 dark:group-hover:text-red-400 transition-colors duration-300"
                                >
                                  {partido.gran_evento || 'Partido Amistoso'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="flex flex-col items-center">
                              <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${result === 'W' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                  result === 'L' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' :
                                    'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                } transition-colors duration-300`}>
                                {`${localScore} - ${visitorScore}`}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Marcador Final
                              </span>
                            </div>

                            <div className="flex flex-col items-end text-sm text-slate-600 dark:text-slate-400">
                              <div className="flex items-center space-x-2 mb-1">
                                <Calendar className="w-4 h-4" />
                                <span className="group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-300">
                                  {partido.fecha}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Clock className="w-4 h-4" />
                                <span>{partido.hora}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                <span className="group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-300">
                                  {partido.localizacion || 'Lugar no especificado'}
                                </span>
                              </div>
                            </div>
                            <Link to={`/Partido/${partido.id}`}>
                              <button
                                className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 transform hover:scale-105 active:scale-95"
                              >
                                <ChevronRight className="h-5 w-5" />
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {!showAllMatches && equipoData?.partido.length > 3 && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                className="relative overflow-hidden group hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors duration-300"
                onClick={loadAllMatches}
              >
                <span className="relative z-10">
                  Cargar Más Partidos
                </span>
                <div
                  className="absolute inset-0 bg-red-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10"
                />
              </Button>
            </div>
          )}
        </section>
        {/* Squad Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-red-500" />
              Plantilla
            </h2>
            {validado && (
              <Link to="/crear/jugador">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white transition-colors duration-300"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Jugadores
                </Button>
              </Link>
            )}
          </div>

          <Tabs defaultValue="portero" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8 bg-slate-100 dark:bg-slate-800">
              <TabsTrigger
                value="portero"
                className="data-[state=active]:bg-red-500 data-[state=active]:text-white transition-colors duration-300"
              >
                Porteros
              </TabsTrigger>
              <TabsTrigger
                value="defensa"
                className="data-[state=active]:bg-red-500 data-[state=active]:text-white transition-colors duration-300"
              >
                Defensas
              </TabsTrigger>
              <TabsTrigger
                value="medio"
                className="data-[state=active]:bg-red-500 data-[state=active]:text-white transition-colors duration-300"
              >
                Medios
              </TabsTrigger>
              <TabsTrigger
                value="delantero"
                className="data-[state=active]:bg-red-500 data-[state=active]:text-white transition-colors duration-300"
              >
                Delanteros
              </TabsTrigger>
            </TabsList>

            {equipoData?.jugador && Object.entries(equipoData.jugador).map(([posicion, jugadores]) => (
              <TabsContent key={posicion} value={posicion}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jugadores
                    .filter(jugador => !jugador.vacio)
                    .map((jugador, index) => (
                      <div
                        key={jugador.id}
                        className="group relative"
                        onMouseEnter={() => setHoveredPlayer(index)}
                        onMouseLeave={() => setHoveredPlayer(null)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-blue-500/5 rounded-lg transform transition-transform duration-300 group-hover:scale-105 opacity-0 group-hover:opacity-100" />
                        <Card className="relative overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-lg">
                          <CardContent className="p-0">
                            <div className="relative h-48 w-full overflow-hidden">
                              <img
                                src="/placeholder.svg?height=200&width=200"
                                alt={jugador.nombre}
                                width={400}
                                height={200}
                                className="object-cover transform transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                              <div className="absolute bottom-4 left-4 right-4">
                                <h3 className="text-xl font-semibold text-white mb-1">
                                  {jugador.nombre}
                                </h3>
                                <Badge
                                  className="bg-red-500/80 text-white hover:bg-red-600/80 transition-colors duration-300"
                                >
                                  {posicion.charAt(0).toUpperCase() + posicion.slice(1)}
                                </Badge>
                              </div>
                              <div className="absolute top-4 right-4">
                                <span className="text-3xl font-bold text-white text-shadow">
                                  {jugador.numero || '-'}
                                </span>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                  <Flag className="w-4 h-4 mr-2 text-red-500" />
                                  {jugador.nacionalidad || 'No especificada'}
                                </div>
                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                  <Users className="w-4 h-4 mr-2 text-red-500" />
                                  {jugador.edad ? `${jugador.edad} años` : 'Edad no especificada'}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>
      </main>
    </div>
  )
}