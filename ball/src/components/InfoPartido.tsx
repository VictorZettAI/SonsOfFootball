'use client'

import EventosPartido from './EventosPartido';
import React, { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Trophy } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useParams, Link } from 'react-router-dom'
import config from '../config';
import { Check_Validation } from "@/contexts/cheking"

type Formation = '4-4-2' | '4-3-3' | '3-5-2' | '4-2-3-1' | '5-3-2'

type Evento = {
  id: number;
  tipo: string;
  equipo: string;
  jugador: string;
  jugador_2?: string;
  hora: string;
}

interface PartidoData {
  id: number;
  estado: string;
  nombre_equipo_local: string;
  nombre_equipo_visitante: string;
  tipo_competicion: string;
  goles_equipo_local: number;
  goles_equipo_visitante: number;
  minuto_actual: string | null;
  fecha: string;
  hora: string;
  lugar: string;
  equipo1: number;
  equipo2: number;
  escudo1: string;
  escudo2: string;
  eventos?: Evento[];
  alineacion: {
    id: number;
    posiciones: number[];
    jugadores: number[];
    equipo: number;
    orden: Formation;
  }[];
  default_equipo: number;
}

const formationPositions: Record<Formation, { x: number, y: number }[][]> = {
  '4-4-2': [
    [{ x: 10, y: 50 }],
    [{ x: 30, y: 20 }, { x: 30, y: 40 }, { x: 30, y: 60 }, { x: 30, y: 80 }],
    [{ x: 60, y: 20 }, { x: 60, y: 40 }, { x: 60, y: 60 }, { x: 60, y: 80 }],
    [{ x: 85, y: 35 }, { x: 85, y: 65 }],
  ],
  '4-3-3': [
    [{ x: 10, y: 50 }],
    [{ x: 30, y: 20 }, { x: 30, y: 40 }, { x: 30, y: 60 }, { x: 30, y: 80 }],
    [{ x: 60, y: 30 }, { x: 60, y: 50 }, { x: 60, y: 70 }],
    [{ x: 85, y: 20 }, { x: 85, y: 50 }, { x: 85, y: 80 }],
  ],
  '3-5-2': [
    [{ x: 10, y: 50 }],
    [{ x: 30, y: 30 }, { x: 30, y: 50 }, { x: 30, y: 70 }],
    [{ x: 55, y: 20 }, { x: 55, y: 35 }, { x: 55, y: 50 }, { x: 55, y: 65 }, { x: 55, y: 80 }],
    [{ x: 85, y: 35 }, { x: 85, y: 65 }],
  ],
  '4-2-3-1': [
    [{ x: 10, y: 50 }],
    [{ x: 30, y: 20 }, { x: 30, y: 40 }, { x: 30, y: 60 }, { x: 30, y: 80 }],
    [{ x: 50, y: 35 }, { x: 50, y: 65 }],
    [{ x: 70, y: 25 }, { x: 70, y: 50 }, { x: 70, y: 75 }],
    [{ x: 85, y: 50 }],
  ],
  '5-3-2': [
    [{ x: 10, y: 50 }],
    [{ x: 30, y: 15 }, { x: 30, y: 32.5 }, { x: 30, y: 50 }, { x: 30, y: 67.5 }, { x: 30, y: 85 }],
    [{ x: 60, y: 30 }, { x: 60, y: 50 }, { x: 60, y: 70 }],
    [{ x: 85, y: 35 }, { x: 85, y: 65 }],
  ]
};

const formations: Record<Formation, number[]> = {
  '4-4-2': [1, 4, 4, 2],
  '4-3-3': [1, 4, 3, 3],
  '3-5-2': [1, 3, 5, 2],
  '4-2-3-1': [1, 4, 2, 3, 1],
  '5-3-2': [1, 5, 3, 2],
}

export default function InfoPartido() {
  const [defaultz, setDefaultz] = useState(null)
  const [partidoData, setPartidoData] = useState<PartidoData>({
    id: 0,
    estado: '',
    nombre_equipo_local: '',
    nombre_equipo_visitante: '',
    tipo_competicion: '',
    goles_equipo_local: 0,
    goles_equipo_visitante: 0,
    minuto_actual: null,
    fecha: '',
    hora: '',
    lugar: '',
    equipo1: 0,
    equipo2: 0,
    eventos: [],
    alineacion: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [homeFormation, setHomeFormation] = useState<Formation>('4-4-2');
  const [awayFormation, setAwayFormation] = useState<Formation>('4-3-3');
  const { id } = useParams();
  const [validado, setValidado] = useState(false)

  useEffect(() => {
    Check_Validation().then((variable) => {
      console.log(variable)
      setValidado(variable)
    })
  }, [])

  const [selectedPlayers, setSelectedPlayers] = useState<{
    home: Record<number, number>,
    away: Record<number, number>
  }>({
    home: {},
    away: {}
  });
  const [teamsData, setTeamsData] = useState<{
    home: any;
    away: any;
  }>({ home: null, away: null });

  // Estado para la conexión SSE
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  useEffect(() => {
    const defaulty = async () => {
      try {
        const response = await fetch(`${config.API_URL}/jugador/default/`)
        const data = await response.json()
        console.log(data)
        if (data) {
          setDefaultz(data.id)
        }
      }
      catch {
        setDefaultz(null)
      }
    }
    defaulty()

  }, []);

  useEffect(() => {
    // Función para obtener estado inicial del partido
    const checkMatchStatus = async () => {
      try {
        const response = await fetch(`${config.API_URL}/partido/${id}/`);
        if (!response.ok) {
          throw new Error('Error al cargar los datos del partido');
        }
        const data = await response.json();
        console.log('Datos iniciales del partido:', data);
        const homex = data.alineacion.find((match) => match.equipo === data.equipo1)
        const awayx = data.alineacion.find((match) => match.equipo === data.equipo2)
        setPartidoData(data);
        setTeamsData({
          home: homex,
          away: awayx
        })
        setSelectedPlayers({
          home: homex?.posiciones || {},
          away: awayx?.posiciones || {}
        })
        setHomeFormation(homex?.orden || '4-4-2')
        setAwayFormation(awayx?.orden || '4-4-2')
        setIsLoading(false);

        // Solo establecemos SSE si el partido está activo
        if (data.estado === 'En Vivo' && !data.finalizado) {
          console.log('entra en el sseeee')
          setupSSE();
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
        setIsLoading(false);
      }
    };

    // Función para configurar SSE
    const setupSSE = () => {
      console.log('activado el sseeeeeee')
      if (eventSource) {
        eventSource.close();
      }

      const sse = new EventSource(`${config.API_URL}/partido/sse/`);
      setEventSource(sse);

      sse.onmessage = (event) => {
        console.log('ciclo una vez mas')
        try {
          const data = JSON.parse(event.data);
          console.log('Datos SSE recibidos:', data);

          // Buscar el partido actual en los datos recibidos
          const currentMatch = data.find((match) => match.partido === Number(id));
          if (currentMatch) {
            setPartidoData(prevData => ({
              ...prevData,
              ...currentMatch,
              eventos: currentMatch.eventos || [],
              goles_equipo_local: currentMatch.marcador_1 || 0,
              goles_equipo_visitante: currentMatch.marcador_2 || 0,
            }));
            const homex = currentMatch.alineacion.find((match) => match.equipo === currentMatch.equipo_1.id)
            const awayx = currentMatch.alineacion.find((match) => match.equipo === currentMatch.equipo_2.id)
            setTeamsData({
              home: homex,
              away: awayx
            })
            setSelectedPlayers({
              home: homex?.posiciones || {},
              away: awayx?.posiciones || {}
            })
            setHomeFormation(homex?.orden || '4-4-2')
            setAwayFormation(awayx?.orden || '4-4-2')
            // Si el partido ha terminado, cerrar SSE
            if (currentMatch.finalizado || currentMatch.estado === 'Finalizado') {
              sse.close();
              setEventSource(null);
            }
          }
          if (!currentMatch) {
            sse.close();
            setEventSource(null);
            console.log('cerrando la conexion?')
            checkMatchStatus();
          }
        } catch (error) {
          console.error('Error al procesar datos SSE:', error);
        }
      };

      sse.onerror = (error) => {
        console.error('Error SSE:', error);
        sse.close();
        setEventSource(null);
        setError('Error en la conexión SSE');
      };
    };

    checkMatchStatus();

    // Cleanup
    return () => {
      console.log('final de trayecto')
      if (eventSource) {
        console.log('el event source lo cierra')
        eventSource.close();
        setEventSource(null);
      }
    };
  }, [id]);

  const teamsState = [
    {
      id: 'home',
      name: partidoData?.nombre_equipo_local || 'Cargando...',
      logo: '/placeholder.svg?height=64&width=64',
      players: [
        { id: 1, name: 'Ederson', number: 31, position: 'GK', goals: 0, yellowCards: 0 },
        { id: 2, name: 'Walker', number: 2, position: 'DF', goals: 0, yellowCards: 1 },
        { id: 3, name: 'Dias', number: 3, position: 'DF', goals: 0, yellowCards: 0 },
        { id: 4, name: 'Stones', number: 5, position: 'DF', goals: 0, yellowCards: 0 },
        { id: 5, name: 'Aké', number: 6, position: 'DF', goals: 0, yellowCards: 0 },
        { id: 6, name: 'Rodri', number: 16, position: 'MF', goals: 0, yellowCards: 0 },
        { id: 7, name: 'De Bruyne', number: 17, position: 'MF', goals: 1, yellowCards: 0 },
        { id: 8, name: 'Bernardo', number: 20, position: 'MF', goals: 0, yellowCards: 0 },
        { id: 9, name: 'Grealish', number: 10, position: 'FW', goals: 0, yellowCards: 0 },
        { id: 10, name: 'Haaland', number: 9, position: 'FW', goals: 1, yellowCards: 0 },
        { id: 11, name: 'Foden', number: 47, position: 'FW', goals: 0, yellowCards: 0 },
      ]
    },
    {
      id: 'away',
      name: partidoData?.nombre_equipo_visitante || 'Cargando...',
      logo: '/placeholder.svg?height=64&width=64',
      players: [
        { id: 12, name: 'Courtois', number: 1, position: 'GK', goals: 0, yellowCards: 0 },
        { id: 13, name: 'Carvajal', number: 2, position: 'DF', goals: 0, yellowCards: 1 },
        { id: 14, name: 'Militão', number: 3, position: 'DF', goals: 0, yellowCards: 0 },
        { id: 15, name: 'Alaba', number: 4, position: 'DF', goals: 0, yellowCards: 0 },
        { id: 16, name: 'Nacho', number: 6, position: 'DF', goals: 0, yellowCards: 0 },
        { id: 17, name: 'Kroos', number: 8, position: 'MF', goals: 0, yellowCards: 0 },
        { id: 18, name: 'Modric', number: 10, position: 'MF', goals: 0, yellowCards: 0 },
        { id: 19, name: 'Camavinga', number: 12, position: 'MF', goals: 0, yellowCards: 1 },
        { id: 20, name: 'Valverde', number: 15, position: 'MF', goals: 0, yellowCards: 0 },
        { id: 21, name: 'Benzema', number: 9, position: 'FW', goals: 1, yellowCards: 0 },
        { id: 22, name: 'Vinicius', number: 20, position: 'FW', goals: 0, yellowCards: 0 },
      ]
    }
  ]

  const renderPlayers = (teamId: 'home' | 'away', formation: Formation) => {
    const team = teamsData[teamId];
    if (!team) return null;

    const positions = formationPositions[formation];
    return positions.flat().map((position, index) => {
      const playerId = selectedPlayers[teamId][index];
      const player = team.jugadores.find((p: any) => p.id === playerId);
      const isHomeTeam = teamId === 'home';
      const xPosition = isHomeTeam ? 100 - position.x : position.x;

      return (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="absolute"
                style={{
                  right: `${xPosition}%`,
                  top: `${position.y}%`,
                  transform: 'translate(50%, -50%)',
                }}
              >
                <div className="flex flex-col items-center relative">
                  <div className="w-5 h-5 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full bg-white dark:bg-gray-800 border border-black flex items-center justify-center">
                    <span className="text-[10px] sm:text-base lg:text-lg font-bold text-black dark:text-white">
                      {player?.numero || '?'}
                    </span>
                  </div>
                  {player && (
                    <span className="max-[320px]:-mt-0.5 min-[375px]:-mt- sm:mt-1 text-[8px] sm:text-sm lg:text-base text-white font-semibold whitespace-nowrap">
                      {player.nombre}
                    </span>
                  )}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs sm:text-sm">
                <p className="font-bold">{player?.nombre || 'Jugador'}</p>
                <p>{player?.posicion || 'POS'}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    });
  };

  // Estados de carga y error
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex items-center justify-center">
        <div className="text-slate-900 dark:text-white text-xl">Cargando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

      <div className="container mx-auto px-4 py-12 md:py-24 lg:py-32">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {validado && !partidoData.finalizado && (
            <Link to={`/consola/${partidoData.id}/`}>
              <Button
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700 shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {partidoData.empezado ? 'Ir a Consola' : 'Comenzar Partido'}
              </Button>
            </Link>
          )}
          <Badge className={`${partidoData?.estado === 'En Vivo' ? 'bg-red-600' :
            partidoData?.estado === 'Finalizado' ? 'bg-red-600' :
              'bg-yellow-600'
            } text-white border-none`}>
            {partidoData?.estado || 'Por Empezar'}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              {`${partidoData?.nombre_equipo_local || 'Cargando...'} vs ${partidoData?.nombre_equipo_visitante || 'Cargando...'}`}
            </span>
          </h1>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            {partidoData?.tipo_competicion || 'Cargando...'}
          </p>
        </motion.div>

        <motion.div
          className="mt-12 grid gap-6 lg:grid-cols-3 lg:gap-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {partidoData?.equipo1 && partidoData.equipo1 != defaultz ? (
            <Link to={`/Equipo/${partidoData.equipo1}`}>
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors group">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="relative">
                    <img
                      src={partidoData?.escudo1 || "/placeholder.svg?height=128&width=128"}
                      alt={partidoData?.nombre_equipo_local || 'Equipo Local'}
                      className="w-32 h-32 rounded-full mb-4 group-hover:scale-105 transition-transform"
                    />
                    <Badge className="absolute -top-2 -right-2 bg-red-600">
                      Local
                    </Badge>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {partidoData?.nombre_equipo_local || 'Cargando...'}
                  </h2>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors group">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="relative">
                  <img
                    src="/placeholder.svg?height=128&width=128"
                    alt=''
                    className="w-32 h-32 rounded-full mb-4 group-hover:scale-105 transition-transform"
                  />
                  <Badge className="absolute -top-2 -right-2 bg-red-600">
                    Local
                  </Badge>

                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Sin determinar
                </h2>
              </CardContent>
            </Card>
          )}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-6xl font-bold text-slate-900 dark:text-white">
              {partidoData?.goles_equipo_local !== null && partidoData?.goles_equipo_visitante !== null
                ? `${partidoData.goles_equipo_local} - ${partidoData.goles_equipo_visitante}`
                : '0 - 0'}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl text-slate-700 dark:text-slate-300">
                {partidoData?.minuto_actual || '--'}
              </span>
              <Progress
                value={partidoData?.minuto_actual ? parseInt(partidoData.minuto_actual) : 0}
                className="w-24 h-1 mt-2"
              />
            </div>
          </div>
          {partidoData?.equipo2 && partidoData.equipo2 != defaultz ? (
            <Link to={`/Equipo/${partidoData.equipo2}`}>
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors group">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="relative">
                    <img
                      src={partidoData?.escudo2 || "/placeholder.svg?height=128&width=128"}
                      alt={partidoData?.nombre_equipo_visitante || 'Equipo Visitante'}
                      className="w-32 h-32 rounded-full mb-4 group-hover:scale-105 transition-transform"
                    />
                    <Badge className="absolute -top-2 -right-2 bg-slate-600">
                      Visitante
                    </Badge>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {partidoData?.nombre_equipo_visitante || 'Cargando...'}
                  </h2>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors group">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="relative">
                  <img
                    src="/placeholder.svg?height=128&width=128"
                    alt=''
                    className="w-32 h-32 rounded-full mb-4 group-hover:scale-105 transition-transform"
                  />
                  <Badge className="absolute -top-2 -right-2 bg-red-600">
                    Visitante
                  </Badge>

                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Sin determinar
                </h2>
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div
          className="mt-8 flex flex-col items-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-center space-x-4 text-slate-700 dark:text-slate-300">
            <Calendar className="w-5 h-5" />
            <span className="text-xl">{partidoData?.fecha || 'Fecha por determinar'}</span>
            <Clock className="w-5 h-5 ml-4" />
            <span className="text-xl">{partidoData?.hora || 'Hora por determinar'}</span>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">{partidoData?.lugar || 'Lugar por determinar'}</p>
        </motion.div>
        <div className="mt-12">
          <Tabs defaultValue="eventos" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800">
              <TabsTrigger
                value="eventos"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                Eventos
              </TabsTrigger>
              <TabsTrigger
                value="alineaciones"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                Alineaciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="eventos" className="mt-4">
              {/* Integración del componente EventosPartido */}
              <EventosPartido
                partidoId={partidoData?.eventos || []}
                home={partidoData.equipo1}
                currentMatchTime={partidoData.minuto_actual || ''}
              />
            </TabsContent>

            <TabsContent value="alineaciones" className="mt-4">
              <Card className="w-full max-w-[2000px] mx-auto bg-gray-100 dark:bg-gray-800">

                <CardContent className="p-4 md:p-8">
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    {/* Equipo Local */}
                    <div className="flex items-center gap-4">
                      <img
                        src="/placeholder.svg?height=64&width=64"
                        alt={`${partidoData?.nombre_equipo_local || 'Local'} logo`}
                        className="w-8 h-8 sm:w-16 sm:h-16"
                      />
                      <div className="flex flex-col items-start">
                        <h2 className="text-lg sm:text-3xl text-black dark:text-white font-bold">
                          {teamsState[0].name}
                        </h2>
                        <span className="text-base sm:text-lg text-black dark:text-white">
                          {homeFormation}
                        </span>
                      </div>
                    </div>

                    {/* Equipo Visitante */}
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <h2 className="text-lg sm:text-3xl text-black dark:text-white font-bold">
                          {teamsState[1].name}
                        </h2>
                        <span className="text-base sm:text-lg text-black dark:text-white">
                          {awayFormation}
                        </span>
                      </div>
                      <img
                        src={teamsState[1].logo}
                        alt={`${teamsState[1].name} logo`}
                        className="w-8 h-8 sm:w-16 sm:h-16"
                      />
                    </div>
                  </div>

                  <div className="relative w-full pb-[56.25%]">
                    <div className="absolute inset-0 bg-green-600 dark:bg-green-700 border-2 border-white dark:border-gray-700 rounded-2xl overflow-hidden shadow-2xl">

                      {/* Field markings */}
                      <div className="absolute inset-0 flex">
                        <div className="w-1/2 border-r-2 border-white dark:border-gray-700"></div>
                        <div className="w-1/2"></div>
                      </div>

                      {/* Center circle */}
                      <div className="absolute top-1/2 left-1/2 w-24 sm:w-36 md:w-48 lg:w-72 h-24 sm:h-36 md:h-48 lg:h-72 border-2 border-white dark:border-gray-700 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

                      {/* Penalty areas */}
                      <div className="absolute top-1/4 left-0 w-1/6 h-2/4 border-r-2 border-y-2 border-white dark:border-gray-700"></div>
                      <div className="absolute top-1/4 right-0 w-1/6 h-2/4 border-l-2 border-y-2 border-white dark:border-gray-700"></div>

                      {/* Goal areas */}
                      <div className="absolute top-[37.5%] left-0 w-[8%] h-1/4 border-r-2 border-y-2 border-white dark:border-gray-700"></div>
                      <div className="absolute top-[37.5%] right-0 w-[8%] h-1/4 border-l-2 border-y-2 border-white dark:border-gray-700"></div>

                      {/* Corner arcs */}
                      <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 border-r-2 border-white dark:border-gray-700 rounded-br-full"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 border-l-2 border-white dark:border-gray-700 rounded-bl-full"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 border-r-2 border-white dark:border-gray-700 rounded-tr-full"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 border-l-2 border-white dark:border-gray-700 rounded-tl-full"></div>

                      {/* Home team */}
                      <div className="absolute inset-y-0 left-0 w-1/2">
                        {renderPlayers('home', homeFormation)}
                      </div>

                      {/* Away team */}
                      <div className="absolute inset-y-0 right-0 w-1/2">
                        {renderPlayers('away', awayFormation)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}