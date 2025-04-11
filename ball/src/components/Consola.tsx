'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, AlertTriangle, Timer, Flag, ArrowRightLeft, ShirtIcon, X, Star, ChevronRight, Goal, Users, Calendar, PlusCircle, MinusCircle, Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"
import { ThemeProvider } from "next-themes"
import { useParams, useNavigate } from 'react-router-dom'
import config from '../config';
import axiosInstance from '@/contexts/axiosConfig'


type MatchPhase = 'setup' | 'inProgress' | 'quarterBreak' | 'extraTimeSetup' | 'extraTimeInProgress' | 'extraTimeQuarterBreak' | 'penaltyShootout' | 'finished'


type Event = {
  id: number
  minute: number
  phase: MatchPhase
  team: 'home' | 'away'
  type: 'goal' | 'yellow-card' | 'red-card' | 'substitution' | 'phase-change' | 'second-yellow-card' | 'penalty' | 'inicio_partido' | 'fin_partido' | 'goal_penalti' | 'fail_penalti'
  player: string
  details?: string
  player1_id?: number
  player2_id?: number
}

type PlayerStatus = 'field' | 'bench' | 'expelled' | 'substituted'

type Player = {
  id: number
  name: string
  number: number
  position: string
  yellowCards: number
  status: PlayerStatus
  goals: number
}

type Team = {
  id: 'home' | 'away'
  name: string
  logo: string
  players: Player[]
}

type Formation = '4-4-2' | '4-3-3' | '3-5-2' | '4-2-3-1' | '5-3-2'

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
}


export default function MatchConsole() {
  const navigate = useNavigate();
  const [quarterDuration, setQuarterDuration] = useState(15)
  const [numberOfQuarters, setNumberOfQuarters] = useState(4)
  const [extraTimeQuarterDuration, setExtraTimeQuarterDuration] = useState(15)
  const [numberOfExtraTimeQuarters, setNumberOfExtraTimeQuarters] = useState(2)
  const [matchPhase, setMatchPhase] = useState<MatchPhase>('setup')
  const [currentQuarter, setCurrentQuarter] = useState(0)
  const [quarterTime, setQuarterTime] = useState(0)
  const [additionalTime, setAdditionalTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null)
  const [selectedType, setSelectedType] = useState<Event['type'] | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null)
  const [selectedSubstitute, setSelectedSubstitute] = useState<number | null>(null)
  const [isExtraTime, setIsExtraTime] = useState(false)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const { id } = useParams();
  const [showExtraTimeDialog, setShowExtraTimeDialog] = useState(false)
  const [showEndMatchDialog, setShowEndMatchDialog] = useState(false)
  const [showPenaltyShootoutDialog, setShowPenaltyShootoutDialog] = useState(false)
  const [showNextPenaltyRoundDialog, setShowNextPenaltyRoundDialog] = useState(false)
  const [penaltyRound, setPenaltyRound] = useState(1)
  const [currentPenaltyTaker, setCurrentPenaltyTaker] = useState<'home' | 'away'>('home')
  const [totalPenalties, setTotalPenalties] = useState(5)
  const [defaultPlayer, setDefaultPlayer] = useState();
  const [finaly, setFinaly] = useState(false)
  const [penaltyShootout, setPenaltyShootout] = useState<{
    home: ('scored' | 'missed' | 'pending')[]
    away: ('scored' | 'missed' | 'pending')[]
  }>({
    home: [],
    away: []
  })
  const [selectedPlayers, setSelectedPlayers] = useState<{
    home: Record<number, number | null>,
    away: Record<number, number | null>
  }>({
    home: {},
    away: {}
  });
  const [isPenaltyShootout, setIsPenaltyShootout] = useState(false)
  const [homeFormation, setHomeFormation] = useState<Formation>('4-4-2')
  const [awayFormation, setAwayFormation] = useState<Formation>('4-3-3')
  const [partidoData, setPartidoData] = useState<PartidoData | null>(null)
  const [teamsState, setTeamsState] = useState<Team[]>([
    {
      id: 'home',
      name: '',
      logo: '/placeholder.svg?height=40&width=40',
      players: Array(11).fill(null).map((_, i) => ({
        id: i + 1,
        name: `Jugador ${i + 1}`,
        number: i + 1,
        position: 'POS',
        yellowCards: 0,
        status: 'field',
        goals: 0
      }))
    },
    {
      id: 'away',
      name: '',
      logo: '/placeholder.svg?height=40&width=40',
      players: Array(11).fill(null).map((_, i) => ({
        id: i + 12,
        name: `Jugador ${i + 1}`,
        number: i + 1,
        position: 'POS',
        yellowCards: 0,
        status: 'field',
        goals: 0
      }))
    }
  ])
  const saveFormation = async () => {
    if (!partidoData?.id) return;

    const homeTeam = teamsState.find(t => t.id === 'home');
    if (!homeTeam) return;

    // Buscar si ya existe una alineación para este equipo y partido
    try {
      const response = await fetch(`${config.API_URL}/alineacion/`);
      const existingAlineaciones = await response.json();
      const homeAlineacion = existingAlineaciones.find(
        (a: any) => a.equipo === partidoData.equipo1 && a.partido === partidoData.id
      );

      const data = {
        partido: partidoData.id,
        equipo: partidoData.equipo1,
        posiciones: ensureElevenPositions(selectedPlayers.home),
        orden: homeFormation
      };

      if (homeAlineacion) {
        await axiosInstance.patch(`/alineacion/mod/${homeAlineacion.id}/`, data);
      } else {
        await axiosInstance.post('/alineacion/create/', data);
      }
    } catch (error) {
      console.error('Error al guardar alineación:', error);
    }
  };
  const save_Formation = async () => {
    if (!partidoData?.id) return;

    const awayTeam = teamsState.find(t => t.id === 'away');
    if (!awayTeam) return;

    // Buscar si ya existe una alineación para este equipo y partido
    try {
      const response = await fetch(`${config.API_URL}/alineacion/`);
      const existingAlineaciones = await response.json();
      const awayAlineacion = existingAlineaciones.find(
        (a: any) => a.equipo === partidoData.equipo2 && a.partido === partidoData.id
      );

      const data = {
        partido: partidoData.id,
        equipo: partidoData.equipo2,
        posiciones: ensureElevenPositions(selectedPlayers.away),
        orden: awayFormation
      };

      if (awayAlineacion) {
        await axiosInstance.patch(`/alineacion/mod/${awayAlineacion.id}/`, data);
      } else {
        await axiosInstance.post('/alineacion/create/', data);
      }
    } catch (error) {
      console.error('Error al guardar alineación:', error);
    }
  };

  const handleStartMatch = async () => {
    if (!partidoData?.id) return;

    try {
      // Crear evento de inicio de partido
      const data = {
        tipo: 'inicio_partido',
        partido: partidoData.id,
        equipo: partidoData.equipo1, // Podría ser cualquiera de los dos equipos
        // hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      }
      await axiosInstance.post('/evento/create/', data);

      // Actualizar estado del partido a "En Vivo"
      const datos = {
        empezado: true
      }
      await axiosInstance.patch(`/partidos/mod/${partidoData.id}/`, datos);

    } catch (error) {
      console.error('Error al iniciar el partido:', error);
    }
  };

  const handleEndMatch = async () => {
    if (!partidoData?.id) return;

    try {
      // Crear evento de fin de partido
      const data = {
        tipo: 'fin_partido',
        partido: partidoData.id,
        equipo: partidoData.equipo1, // Podría ser cualquiera de los dos equipos
        // hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      }
      await axiosInstance.post('/evento/create/', data);

      // Actualizar estado del partido a "Finalizado"
      const datos = {
        finalizado: true
      }
      await axiosInstance.patch(`/partidos/mod/${partidoData.id}/`, datos);

    } catch (error) {
      console.error('Error al finalizar el partido:', error);
    }
  };

  const ensureElevenPositions = (positions: Record<number, number>) => {
    const result = [...Array(11)].map((_, index) =>
      positions[index] || defaultPlayer
    );
    return result;
  };

  useEffect(() => {
    const fetchPartidoData = async () => {
      try {
        const response = await fetch(`${config.API_URL}/partido/${id}/`);
        const data = await response.json();
        console.log(data)
        setPartidoData(data);
        setHomeScore(data.goles_equipo_local);
        setAwayScore(data.goles_equipo_visitante);
        setDefaultPlayer(data.default_jugador)
        // Cargar alineaciones si existen
        if (data.alineacion && data.alineacion.length > 0) {
          const homeAlineacion = data.alineacion.find(a => a.equipo === data.equipo1);
          const awayAlineacion = data.alineacion.find(a => a.equipo === data.equipo2);

          if (homeAlineacion) {
            setHomeFormation(homeAlineacion.orden as Formation);
            setSelectedPlayers(prev => ({
              ...prev,
              home: Object.fromEntries(homeAlineacion.posiciones.map((id, index) => [index, id]))
            }));
          }

          if (awayAlineacion) {
            setAwayFormation(awayAlineacion.orden as Formation);
            setSelectedPlayers(prev => ({
              ...prev,
              away: Object.fromEntries(awayAlineacion.posiciones.map((id, index) => [index, id]))
            }));
          }
        }

        // Inicializar selectedPlayers con el jugador por defecto
        const initialPositions = Array(11).fill(defaultPlayer);
        setSelectedPlayers(prev => ({
          home: prev.home || Object.fromEntries(initialPositions.map((id, index) => [index, id])),
          away: prev.away || Object.fromEntries(initialPositions.map((id, index) => [index, id]))
        }));

        // Fetch y configuración de equipos
        const homeTeamResponse = await fetch(`${config.API_URL}/equipo/${data.equipo1}/`);
        const awayTeamResponse = await fetch(`${config.API_URL}/equipo/${data.equipo2}/`);
        const homeTeamData = await homeTeamResponse.json();
        const awayTeamData = await awayTeamResponse.json();
        console.log(homeTeamData)
        console.log(awayTeamData)
        setTeamsState([
          {
            id: 'home',
            name: data.nombre_equipo_local,
            logo: homeTeamData.escudo || '/placeholder.svg?height=40&width=40',
            players: Object.values(homeTeamData.jugador).flat().map(j => ({
              id: j.id,
              name: j.nombre,
              number: j.numero || 0,
              position: j.posicion,
              yellowCards: 0,
              status: 'field',
              goals: 0
            }))
          },
          {
            id: 'away',
            name: data.nombre_equipo_visitante,
            logo: awayTeamData.escudo || '/placeholder.svg?height=40&width=40',
            players: Object.values(awayTeamData.jugador).flat().map(j => ({
              id: j.id,
              name: j.nombre,
              number: j.numero || 0,
              position: j.posicion,
              yellowCards: 0,
              status: 'field',
              goals: 0
            }))
          }
        ]);

        // Procesar eventos
        if (data.eventos) {
          console.log(data.eventos)
          const eventosFormateados = data.eventos.map(e => ({
            id: e.id,
            minute: parseInt(e.hora?.split(':')[1]) || 0,
            phase: 'inProgress',
            team: data.nombre_equipo_local === e.equipo_nombre ? 'home' : 'away',
            type: e.tipo === 'tarjeta_roja' ? 'red-card' :
              e.tipo === 'tarjeta_amarilla' ? 'yellow-card' :
                e.tipo === 'gol' ? 'goal' :
                  e.tipo === 'sustitucion' ? 'substitution' :
                    e.tipo === 'penalti' ? 'penalty' : e.tipo,
            player: e.jugador ? e.jugador.nombre : '',
            details: e.jugador_2 ? `${e.jugador_2.nombre} entra por ${e.jugador.nombre}` : undefined,
            player1_id: e.jugador ? e.jugador.id : '',
            player2_id: e.jugador_2 ? e.jugador_2.id : ''
          }));
          setEvents(eventosFormateados);
        }

      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchPartidoData();
  }, [id, defaultPlayer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getCurrentTime = () => {
    return formatTime(quarterTime)
  }

  const getPhaseDisplay = () => {
    switch (matchPhase) {
      case 'setup': return 'CONFIGURACIÓN'
      case 'inProgress': return isExtraTime ? `PRÓRROGA (CUARTO ${currentQuarter - numberOfQuarters})` : `CUARTO ${currentQuarter}`
      case 'quarterBreak': return isExtraTime ? `DESCANSO PRÓRROGA (CUARTO ${currentQuarter - numberOfQuarters})` : `DESCANSO (CUARTO ${currentQuarter})`
      case 'extraTimeSetup': return 'CONFIGURACIÓN PRÓRROGA'
      case 'penaltyShootout': return 'TANDA DE PENALTIS'
      case 'finished': return 'FINAL DEL PARTIDO'
      default: return ''
    }
  }

  const handleQuarterEnd = useCallback(() => {
    setIsPlaying(false);
    let newPhase: MatchPhase = matchPhase;
    let phaseChangeEvent: Event | null = null;

    if (!isExtraTime && currentQuarter < numberOfQuarters) {
      newPhase = 'quarterBreak';
      phaseChangeEvent = {
        id: Date.now(),
        minute: currentQuarter * quarterDuration,
        phase: matchPhase,
        team: 'home',
        type: 'phase-change',
        player: '',
        details: `Final del Cuarto ${currentQuarter}`
      };
    } else if (isExtraTime && currentQuarter < numberOfQuarters + numberOfExtraTimeQuarters) {
      newPhase = 'extraTimeQuarterBreak';
      phaseChangeEvent = {
        id: Date.now(),
        minute: numberOfQuarters * quarterDuration + (currentQuarter - numberOfQuarters) * extraTimeQuarterDuration,
        phase: matchPhase,
        team: 'home',
        type: 'phase-change',
        player: '',
        details: `Final del Cuarto ${currentQuarter - numberOfQuarters} de Prórroga`
      };
    } else {
      if (!isExtraTime) {
        setShowExtraTimeDialog(true);
      } else {
        setShowEndMatchDialog(true);
      }
      return;
    }

    setMatchPhase(newPhase);
    if (phaseChangeEvent) {
      setEvents(prev => [...prev, phaseChangeEvent]);
    }
  }, [
    currentQuarter,
    quarterDuration,
    numberOfQuarters,
    isExtraTime,
    extraTimeQuarterDuration,
    numberOfExtraTimeQuarters,
    matchPhase
  ]);

  // Efecto para el temporizador
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isPlaying && ['inProgress', 'extraTimeInProgress'].includes(matchPhase)) {
      const startTime = Date.now() - (quarterTime * 1000);

      intervalId = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const currentQuarterDuration = isExtraTime ? extraTimeQuarterDuration : quarterDuration;
        const maxTime = currentQuarterDuration * 60 + additionalTime * 60;

        if (elapsedSeconds >= maxTime) {
          handleQuarterEnd();
          setQuarterTime(maxTime);
          if (intervalId) clearInterval(intervalId);
        } else {
          setQuarterTime(elapsedSeconds);
        }
      }, 1000); // Actualizar más frecuentemente

      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }
  }, [isPlaying, matchPhase]); // Reducir dependencias

  // useEffect(() => {
  //   console.log('entra para mod')
  //   const updateMatchData = async () => {
  //     if (partidoData?.id) {
  //       try {
  //         const data = {
  //           marcador_1: homeScore,
  //           marcador_2: awayScore,
  //           minuto_actual: `${Math.floor(getCurrentMinute())}'`,
  //           tiempo_extra: additionalTime,
  //           minutos_jugados: isExtraTime ?
  //             (numberOfQuarters * quarterDuration) + (currentQuarter - numberOfQuarters) * extraTimeQuarterDuration :
  //             currentQuarter * quarterDuration
  //         }
  //         const response = await axiosInstance.patch(`/partidos/mod/${id}/`, data);

  //       } catch (error) {
  //         console.error('Error al actualizar el servidor:', error);
  //       }
  //     }
  //   };
  //   console.log(isPlaying)
  //   // Actualizar cuando cambien valores relevantes
  //   if (isPlaying) {
  //     updateMatchData();
  //   }
  // }, [
  //   homeScore,
  //   awayScore,
  //   matchPhase,
  //   // quarterTime,
  //   // currentQuarter,
  //   // additionalTime,
  //   // isPlaying,
  //   // partidoData?.id
  // ]);

  const startNextQuarter = () => {
    // Si es el primer cuarto (inicio del partido), crear evento de inicio
    if (currentQuarter === 0) {
      console.log('entra aqui')

      // Actualizar el estado del partido en el backend
      const data = {
        empezado: true,
        finalizado: false
      }
      try {
        axiosInstance.patch(`/partidos/mod/${id}/`, data)
      }
      catch (error) {
        console.error('Error al actualizar el estado del partido:', error);
      };

      const createEvent = async () => {
        try {
          const datos = {
            tipo: 'inicio_partido',
            partido: partidoData?.id,
            equipo: null,
            jugador: null,
            jugador_2: null,
            // hora: null,
            detalles: null
          }
          const resp = await axiosInstance.post('/evento/create/', datos);
          const response = resp.data
          console.log(response)
          const startMatchEvent = {
            id: response.id,
            minute: 0,
            phase: matchPhase,
            team: 'home',
            type: 'inicio_partido',
            player: '',
          };
          setEvents(prev => [...prev, startMatchEvent]);
        } catch (error) {
          console.error('Error al crear evento de fin:', error);
        }
      };
      createEvent();
    }

    let newPhase: MatchPhase = isExtraTime ? 'extraTimeInProgress' : 'inProgress'
    let phaseChangeEvent: Event | null = null

    const nextQuarter = currentQuarter + 1
    setCurrentQuarter(nextQuarter)

    if (!isExtraTime) {
      phaseChangeEvent = {
        id: Date.now(),
        minute: (nextQuarter - 1) * quarterDuration,
        phase: matchPhase,
        team: 'home',
        type: 'phase-change',
        player: '',
        details: `Inicio del Cuarto ${nextQuarter}`
      }
    } else {
      phaseChangeEvent = {
        id: Date.now(),
        minute: numberOfQuarters * quarterDuration + (nextQuarter - numberOfQuarters - 1) * extraTimeQuarterDuration,
        phase: matchPhase,
        team: 'home',
        type: 'phase-change',
        player: '',
        details: `Inicio del Cuarto ${nextQuarter - numberOfQuarters} de Prórroga`
      }
    }

    setMatchPhase(newPhase)
    setQuarterTime(0)
    setIsPlaying(true)
    if (phaseChangeEvent) {
      setEvents(prev => [...prev, phaseChangeEvent])
    }
  }

  const handleExtraTimeDecision = (addExtraTime: boolean) => {
    setShowExtraTimeDialog(false)
    if (addExtraTime) {
      setMatchPhase('extraTimeSetup')
      setIsExtraTime(true)
      setCurrentQuarter(numberOfQuarters)
    } else {
      setShowPenaltyShootoutDialog(true)
    }
  }

  const handleEndMatchDecision = (endMatch: boolean) => {
    setShowEndMatchDialog(false)
    if (endMatch) {
      finishMatch()
    } else {
      setShowPenaltyShootoutDialog(true)
    }
  }

  const finishMatch = () => {
    setMatchPhase('finished')
    // Crear evento de fin de partido
    const finalEvent: Event = {
      id: Date.now(),
      minute: numberOfQuarters * quarterDuration + (isExtraTime ? numberOfExtraTimeQuarters * extraTimeQuarterDuration : 0),
      phase: matchPhase,
      team: 'home',
      type: 'fin_partido',
      player: '',
      details: 'Fin del Partido'
    }
    setEvents(prev => [...prev, finalEvent])

    // // Actualizar el estado del partido en el backend
    // const data = {
    //   finalizado: true
    // }
    // try {
    //   axiosInstance.patch(`/partidos/mod/${id}/`, data)
    // }

    // catch (error) {
    //   console.error('Error al actualizar el estado del partido:', error);
    // };

    // Enviar evento al backend
    const createEvent = async () => {
      try {
        const hours = Math.floor(finalEvent.minute / 60);
        const minutes = finalEvent.minute % 60;
        // const hora = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const data = {
          tipo: 'fin_partido',
          partido: partidoData?.id,
          equipo: null,
          jugador: null,
          jugador_2: null,
          // hora: hora,
          detalles: finalEvent.details
        }
        console.log(data)
        await axiosInstance.post('/evento/create/', data);
      } catch (error) {
        console.error('Error al crear evento de fin:', error);
      }
    };
    createEvent();

    const redireccion_partido = () => {
      navigate(`/Partido/${id}/`);
    }
    const updateMatchData = async () => {
      if (partidoData?.id) {
        try {
          const data = {
            finalizado: true,
            minutos_jugados: isExtraTime ?
              (numberOfQuarters * quarterDuration) + (currentQuarter - numberOfQuarters) * extraTimeQuarterDuration :
              currentQuarter * quarterDuration
          }
          const response = await axiosInstance.patch(`/partidos/mod/${id}/`, data);
          redireccion_partido();
        } catch (error) {
          console.error('Error al actualizar el servidor:', error);
        }
      }
    };

    updateMatchData();
  }


  const handlePenaltyShootoutDecision = (startPenaltyShootout: boolean) => {
    setIsPlaying(true)
    setShowPenaltyShootoutDialog(false)
    if (startPenaltyShootout) {
      setMatchPhase('penaltyShootout')
      setIsPenaltyShootout(true)
      setPenaltyRound(1)
      const penaltyEvent: Event = {
        id: Date.now(),
        minute: numberOfQuarters * quarterDuration + (isExtraTime ? numberOfExtraTimeQuarters * extraTimeQuarterDuration : 0),
        phase: matchPhase,
        team: 'home',
        type: 'phase-change',
        player: '',
        details: 'Inicio de la Tanda de Penaltis'
      }
      setEvents(prev => [...prev, penaltyEvent])
      setPenaltyShootout({
        home: Array(5).fill('pending'),
        away: Array(5).fill('pending')
      })
    } else {
      finishMatch()
    }
  }

  const handleNextPenaltyRoundDecision = (continueShootout: boolean) => {
    setShowNextPenaltyRoundDialog(false)
    if (continueShootout) {
      // Reset for next round
      setPenaltyRound(1)
      setPenaltyShootout({
        home: Array(5).fill('pending'),
        away: Array(5).fill('pending')
      })
      setCurrentPenaltyTaker('home')
    } else {
      finishMatch()
    }
  }

  const addEvent = async () => {
    if (selectedTeam && selectedType && selectedPlayer) {
      const team = teamsState.find(t => t.id === selectedTeam);
      const player = team?.players.find(p => p.id === selectedPlayer);
      if (!team || !player) return;

      let newEvent: Event = {
        id: Date.now(),
        minute: Math.floor(getCurrentMinute()),
        phase: matchPhase,
        team: selectedTeam,
        type: selectedType,
        player: player.name,
      };

      let updatedTeamsState = [...teamsState];
      let tipo_amarilla = 'vacio'
      if (selectedType === 'substitution' && selectedSubstitute) {
        // Encontrar el jugador que entra
        const substitutePlayer = team.players.find(p => p.id === selectedSubstitute);
        if (substitutePlayer) {
          // Actualizar el evento con los detalles de la sustitución
          newEvent.details = `${substitutePlayer.name} entra por ${player.name}`;

          // Actualizar el estado de los jugadores
          updatedTeamsState = teamsState.map(t => {
            if (t.id === selectedTeam) {
              return {
                ...t,
                players: t.players.map(p => {
                  if (p.id === selectedPlayer) {
                    // Jugador que sale
                    return { ...p, status: 'substituted' };
                  }
                  if (p.id === selectedSubstitute) {
                    // Jugador que entra
                    return { ...p, status: 'field' };
                  }
                  return p;
                })
              };
            }
            return t;
          });

          // Actualizar la posición en el campo
          setSelectedPlayers(prev => {
            const newSelectedPlayers = { ...prev };
            const positionIndex = Object.entries(prev[selectedTeam])
              .find(([, playerId]) => playerId === selectedPlayer)?.[0];

            if (positionIndex) {
              newSelectedPlayers[selectedTeam][parseInt(positionIndex)] = selectedSubstitute;
            }

            return newSelectedPlayers;
          });
        }
      } else if (selectedType === 'yellow-card') {
        updatedTeamsState = teamsState.map(t => {
          if (t.id === selectedTeam) {
            return {
              ...t,
              players: t.players.map(p => {
                if (p.id === selectedPlayer) {
                  const updatedPlayer = { ...p, yellowCards: p.yellowCards + 1 };
                  if (updatedPlayer.yellowCards === 2) {
                    newEvent.type = 'second-yellow-card';
                    newEvent.details = 'Segunda Amarilla y Expulsión';
                    updatedPlayer.status = 'expelled';
                    tipo_amarilla = 'second-yellow-card'
                  }
                  return updatedPlayer;
                }
                return p;
              })
            };
          }
          return t;
        });
      } else if (selectedType === 'red-card') {
        updatedTeamsState = teamsState.map(t => {
          if (t.id === selectedTeam) {
            return {
              ...t,
              players: t.players.map(p => {
                if (p.id === selectedPlayer) {
                  return { ...p, status: 'expelled' };
                }
                return p;
              })
            };
          }
          return t;
        });
        newEvent.details = 'Tarjeta Roja Directa';

      } else if (selectedType === 'goal') {
        updatedTeamsState = teamsState.map(t => {
          if (t.id === selectedTeam) {
            return {
              ...t,
              players: t.players.map(p => {
                if (p.id === selectedPlayer) {
                  return { ...p, goals: p.goals + 1 };
                }
                return p;
              })
            };
          }
          return t;
        });
      }

      // Actualizar el estado de los equipos
      setTeamsState(updatedTeamsState);

      // Enviar el evento al backend
      try {
        const datos = {
          tipo: tipo_amarilla === 'second-yellow-card' ? 'segunda_tarjeta_amarilla' :
            selectedType === 'red-card' ? 'tarjeta_roja' :
              selectedType === 'yellow-card' ? 'tarjeta_amarilla' :
                selectedType === 'goal' ? 'gol' :
                  selectedType === 'substitution' ? 'sustitucion' :
                    selectedType === 'penalty' ? 'penalti' : 'falta',
          equipo: selectedTeam === 'home' ? partidoData?.equipo1 : partidoData?.equipo2,
          jugador: player.id,
          jugador_2: selectedType === 'substitution' ? selectedSubstitute : undefined,
          partido: partidoData?.id,
          /* hora: new Date().toISOString() */
        }
        tipo_amarilla = 'vacio'
        const response = await axiosInstance.post('/evento/create/', datos)
        const data = await response.data
        newEvent.id = data.id
        newEvent.player1_id = data.jugador ? data.jugador : ''
        newEvent.player2_id = data.jugador_2 ? data.jugador_2 : ''
        console.log('Respuesta del backend:', data)
      }
      catch (error) {
        console.error('Error:', error)
      };

      // Actualizar los eventos y el marcador
      setEvents(prev => [...prev, newEvent]);
      if (selectedType === 'goal') {
        if (selectedTeam === 'home') {
          setHomeScore(prev => prev + 1);
        } else {
          setAwayScore(prev => prev + 1);
        }
      }

      // Resetear las selecciones
      setSelectedTeam(null);
      setSelectedType(null);
      setSelectedPlayer(null);
      setSelectedSubstitute(null);
    }
  };

  const removeEvent = (eventToRemove: Event) => {
    // Primero eliminar del backend
    try {
      axiosInstance.delete(`/evento/mod/${eventToRemove.id}/`)
      // Si la eliminación en el backend es exitosa, procedemos con toda la lógica local
      setEvents(prev => prev.filter(event => event.id !== eventToRemove.id))
      console.log(eventToRemove)
      console.log(partidoData)
      if (eventToRemove.type === 'goal') {
        if (eventToRemove.team === 'home') {
          setHomeScore(prev => Math.max(0, prev - 1))
        } else {
          setAwayScore(prev => Math.max(0, prev - 1))
        }
      }
      if (eventToRemove.type === 'yellow-card' || eventToRemove.type === 'second-yellow-card' || eventToRemove.type === 'red-card') {
        setTeamsState(prevTeams =>
          prevTeams.map(team =>
            team.id === eventToRemove.team
              ? {
                ...team,
                players: team.players.map(p =>
                  p.name === eventToRemove.player
                    ? {
                      ...p,
                      yellowCards: eventToRemove.type === 'yellow-card' ? Math.max(0, p.yellowCards - 1) : p.yellowCards,
                      status: eventToRemove.type === 'second-yellow-card' || eventToRemove.type === 'red-card' ? 'field' : p.status
                    }
                    : p
                )
              }
              : team
          )
        )
      }
      if (eventToRemove.type === 'substitution') {
        const [playerIn, playerOut] = eventToRemove.details?.split(' entra por ') || []
        setTeamsState(prevTeams =>
          prevTeams.map(team =>
            team.id === eventToRemove.team
              ? {
                ...team,
                players: team.players.map(p =>
                  p.name === playerIn
                    ? { ...p, status: 'bench' }
                    : p.name === playerOut
                      ? { ...p, status: 'field' }
                      : p
                )
              }
              : team
          )
        )
        setSelectedPlayers(prev => {
          const selectedTeam = eventToRemove.team
          const playerOut_id = eventToRemove.player2_id
          const playerIn_id = eventToRemove.player1_id
          console.log(prev)
          const newSelectedPlayers = { ...prev };
          const positionIndex = Object.entries(prev[selectedTeam])
            .find(([, playerId]) => playerId === playerOut_id)?.[0];

          if (positionIndex) {
            newSelectedPlayers[selectedTeam][parseInt(positionIndex)] = playerIn_id;
          }
          return newSelectedPlayers;
        });
      }

    } catch (error) { console.error('Error al eliminar el evento:', error) };
  }

  const getCurrentMinute = () => {
    if (isExtraTime) {
      const regularTimeMinutes = numberOfQuarters * quarterDuration
      const extraTimeMinutes = (currentQuarter - numberOfQuarters - 1) * extraTimeQuarterDuration
      const currentMinutes = quarterTime / 60
      return regularTimeMinutes + extraTimeMinutes + currentMinutes
    } else {
      const baseMinutes = (currentQuarter - 1) * quarterDuration
      const currentMinutes = quarterTime / 60
      return baseMinutes + currentMinutes
    }
  }
  const handlePenaltyKick = async (result: 'scored' | 'missed') => {
    const newPenaltyShootout = { ...penaltyShootout }
    newPenaltyShootout[currentPenaltyTaker][penaltyRound - 1] = result
    setPenaltyShootout(newPenaltyShootout)

    const newEvent: Event = {
      id: Date.now(),
      minute: numberOfQuarters * quarterDuration + (isExtraTime ? numberOfExtraTimeQuarters * extraTimeQuarterDuration : 0),
      phase: 'penaltyShootout',
      team: currentPenaltyTaker,
      type: result === 'scored' ? 'goal_penalti' : 'fail_penalti',
      player: '',
      details: result === 'scored' ? 'Gol' : 'Fallado'
    }
    setEvents(prev => [...prev, newEvent])
    const partido_equipo = currentPenaltyTaker === 'home' ? partidoData.equipo1 : partidoData.equipo2
    console.log(partido_equipo)
    let data = {}
    if (result === 'scored') {
      data = {
        tipo: 'gol_penalti',
        partido: partidoData.id,
        equipo: partido_equipo,
      }
    }
    else {
      data = {
        tipo: 'fallo_penalti',
        partido: partidoData.id,
        equipo: partido_equipo,
      }
    }

    await axiosInstance.post('/evento/create/', data);

    if (result === 'scored') {

      if (currentPenaltyTaker === 'home') {
        setHomeScore(prev => prev + 1);
      } else {
        setAwayScore(prev => prev + 1);
      }
    }

    setCurrentPenaltyTaker(prev => prev === 'home' ? 'away' : 'home')

    const homeScored = newPenaltyShootout.home.filter(r => r === 'scored').length
    const awayScored = newPenaltyShootout.away.filter(r => r === 'scored').length
    if (penaltyRound >= 5 && finaly) {
      setShowNextPenaltyRoundDialog(true)
    }
    if (penaltyRound >= 5) {
      setFinaly(true)
    }
    else if (finaly !== false) {
      setFinaly(false)
    }
    if (currentPenaltyTaker === 'away') {
      setPenaltyRound(prev => prev + 1)
    }
  }


  const renderPlayers = (teamId: 'home' | 'away', formation: Formation) => {
    const team = teamsState.find((t) => t.id === teamId)
    if (!team || team.players.length === 0) return null

    const positions = formationPositions[formation]
    if (!positions) return null

    return positions.flat().map((position, index) => {
      const selectedPlayerId = selectedPlayers[teamId][index]
      const player = team.players.find(p => p.id === selectedPlayerId)
      const isHomeTeam = teamId === 'home'
      const xPosition = isHomeTeam ? 100 - position.x : position.x

      return (
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
              <Select
                onValueChange={(value) => {
                  setSelectedPlayers(prev => ({
                    ...prev,
                    [teamId]: { ...prev[teamId], [index]: parseInt(value) || defaultPlayer }
                  }));
                }}
              >
                <SelectTrigger className="w-full h-full flex items-center justify-center bg-transparent border-0 hover:bg-transparent focus:ring-0 focus-visible:ring-0 [&>svg]:hidden p-0">
                  <span className="flex items-center justify-center text-[10px] sm:text-base lg:text-lg font-bold text-black dark:text-white">
                    {player ? player.number : '?'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {team.players.filter(p => p.status !== 'expelled').map(playerOption => (
                    <SelectItem key={playerOption.id} value={playerOption.id.toString()}>
                      {playerOption.name} ({playerOption.number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {player && (
              <span className="max-[320px]:-mt-0.5 min-[375px]:-mt- sm:mt-1 text-[8px] sm:text-sm lg:text-base text-white font-semibold whitespace-nowrap">
                {player.name}
              </span>
            )}
          </div>
        </div>
      );
    });
  };


  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 py-12">
          <motion.h2
            className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100 transition-colors duration-300"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            Panel de Control del Partido
          </motion.h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Match Control */}
            <Card className="overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Users className="w-6 h-6 text-red-500 dark:text-red-400" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">Control del Partido</span>
                  </div>
                  <Badge variant="outline" className="text-3xl font-bold px-4 py-1.5 bg-red-100 dark:bg-red-800/20 text-red-800 dark:text-red-200">
                    {homeScore} - {awayScore}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Match Setup */}
                {matchPhase === 'setup' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Número de Cuartos</Label>
                      <Select
                        value={numberOfQuarters.toString()}
                        onValueChange={(value) => setNumberOfQuarters(parseInt(value))}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Seleccionar número de cuartos" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? 'cuarto' : 'cuartos'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Duración de cada Cuarto</Label>
                      <Select
                        value={quarterDuration.toString()}
                        onValueChange={(value) => setQuarterDuration(parseInt(value))}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Seleccionar duración" />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 10, 15, 20, 25, 30, 35, 40, 45].map((duration) => (
                            <SelectItem key={duration} value={duration.toString()}>
                              {duration} minutos
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Extra Time Setup */}
                {matchPhase === 'extraTimeSetup' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Número de Cuartos de Prórroga</Label>
                      <Select
                        value={numberOfExtraTimeQuarters.toString()}
                        onValueChange={(value) => setNumberOfExtraTimeQuarters(parseInt(value))}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Seleccionar número de cuartos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 cuarto</SelectItem>
                          <SelectItem value="2">2 cuartos</SelectItem>
                          <SelectItem value="4">4 cuartos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Duración de cada Cuarto de Prórroga</Label>
                      <Select
                        value={extraTimeQuarterDuration.toString()}
                        onValueChange={(value) => setExtraTimeQuarterDuration(parseInt(value))}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Seleccionar duración" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 minutos</SelectItem>
                          <SelectItem value="10">10 minutos</SelectItem>
                          <SelectItem value="15">15 minutos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Timer Control */}
                <div className="p-6 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-10 h-10 text-red-500 dark:text-red-400" />
                      <span className="text-5xl font-mono font-bold text-red-600 dark:text-red-400">
                        {getCurrentTime()}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-lg px-4 py-1.5 bg-red-100 dark:bg-red-800/20 text-red-800 dark:text-red-200">
                      {getPhaseDisplay()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleQuarterEnd}
                      disabled={!isPlaying}
                      className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-base transition-colors duration-300 font-semibold"
                    >
                      <Flag className="w-5 h-5 mr-2" />
                      Finalizar Cuarto
                    </Button>
                    <div className="space-x-2">
                      {(matchPhase === 'setup' || matchPhase === 'quarterBreak' || matchPhase === 'extraTimeSetup' || matchPhase === 'extraTimeQuarterBreak') && (
                        <Button
                          onClick={startNextQuarter}
                          className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white text-base transition-colors duration-300 font-semibold"
                        >
                          {matchPhase === 'setup' ? 'Iniciar Partido' : 'Iniciar Siguiente Cuarto'}
                        </Button>
                      )}
                      {isPlaying && (
                        <Button
                          variant="outline"
                          onClick={() => setIsPlaying(false)}
                          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-base transition-colors duration-300 font-semibold"
                        >
                          Pausar
                        </Button>
                      )}
                      {!isPlaying && ['inProgress', 'extraTimeInProgress'].includes(matchPhase) && (
                        <Button
                          onClick={() => setIsPlaying(true)}
                          className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white text-base transition-colors duration-300 font-semibold"
                        >
                          Reanudar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Time Control */}
                {isPlaying && ['inProgress', 'extraTimeInProgress'].includes(matchPhase) && (
                  <div className="flex items-center justify-between space-x-4">
                    <Label>Tiempo Adicional</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setAdditionalTime(prev => Math.max(0, prev - 1))}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={additionalTime}
                        onChange={(e) => setAdditionalTime(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-16 text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setAdditionalTime(prev => prev + 1)}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Event Buttons */}
                {isPlaying && matchPhase !== 'penaltyShootout' && (
                  <div className="space-y-4">
                    <Label>Seleccionar Equipo</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {teamsState.map((team) => (
                        <Button
                          key={team.id}
                          variant={selectedTeam === team.id ? "default" : "outline"}
                          className={`h-auto py-4 ${selectedTeam === team.id
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                            } transition-colors duration-300`}
                          onClick={() => setSelectedTeam(team.id as 'home' | 'away')}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <img src={team.logo} alt={team.name} className="w-12 h-12" />
                            <span className="text-gray-900 dark:text-gray-100">{team.name}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTeam && matchPhase !== 'penaltyShootout' && (
                  <div className="space-y-4">
                    <Label>Seleccionar Tipo de Evento</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant={selectedType === 'goal' ? "default" : "outline"}
                        onClick={() => setSelectedType('goal')}
                        className={`${selectedType === 'goal'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                          } transition-colors duration-300`}
                      >
                        <Goal className="mr-2" /> Gol
                      </Button>
                      <Button
                        variant={selectedType === 'yellow-card' ? "default" : "outline"}
                        onClick={() => setSelectedType('yellow-card')}
                        className={`${selectedType === 'yellow-card'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                          } transition-colors duration-300`}
                      >
                        <div className="w-4 h-6 bg-yellow-400 dark:bg-yellow-500 mr-2" /> Tarjeta Amarilla
                      </Button>
                      <Button
                        variant={selectedType === 'red-card' ? "default" : "outline"}
                        onClick={() => setSelectedType('red-card')}
                        className={`${selectedType === 'red-card'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                          } transition-colors duration-300`}
                      >
                        <div className="w-4 h-6 bg-red-500 dark:bg-red-600 mr-2" /> Tarjeta Roja
                      </Button>
                      <Button
                        variant={selectedType === 'substitution' ? "default" : "outline"}
                        onClick={() => setSelectedType('substitution')}
                        className={`${selectedType === 'substitution'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                          } transition-colors duration-300`}
                      >
                        <ArrowRightLeft className="mr-2" /> Sustitución
                      </Button>
                    </div>
                  </div>
                )}

                {selectedType && selectedTeam && matchPhase !== 'penaltyShootout' && (
                  <div className="space-y-4">
                    {selectedType === 'substitution' ? (
                      // Lógica de sustitución
                      <div className="space-y-4">
                        <Label>Seleccionar Jugador que Sale</Label>
                        <div className="grid grid-cols-2 gap-4">
                          {teamsState
                            .find(t => t.id === selectedTeam)
                            ?.players.filter(p => {
                              const isInFormation = Object.values(selectedPlayers[selectedTeam]).includes(p.id);
                              return isInFormation && p.status !== 'substituted' && p.status !== 'expelled';
                            })
                            .map((player) => (
                              <Button
                                key={player.id}
                                variant={selectedPlayer === player.id ? "default" : "outline"}
                                onClick={() => setSelectedPlayer(player.id)}
                                className={`${selectedPlayer === player.id
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                  } transition-colors duration-300`}
                              >
                                {player.number} - {player.name}
                                <Badge variant="secondary" className="ml-2">
                                  {player.position}
                                </Badge>
                              </Button>
                            ))}
                        </div>

                        {selectedPlayer && (
                          <>
                            <Label>Seleccionar Jugador que Entra</Label>
                            <div className="grid grid-cols-2 gap-4">
                              {teamsState
                                .find(t => t.id === selectedTeam)
                                ?.players.filter(p => {
                                  const isNotInFormation = !Object.values(selectedPlayers[selectedTeam]).includes(p.id);
                                  const isNotSelectedPlayer = p.id !== selectedPlayer;
                                  return isNotInFormation && isNotSelectedPlayer && p.status !== 'expelled' && p.status !== 'substituted';
                                })
                                .map((player) => (
                                  <Button
                                    key={player.id}
                                    variant={selectedSubstitute === player.id ? "default" : "outline"}
                                    onClick={() => setSelectedSubstitute(player.id)}
                                    className={`${selectedSubstitute === player.id
                                      ? 'bg-red-500 text-white'
                                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                      } transition-colors duration-300`}
                                  >
                                    {player.number} - {player.name}
                                    <Badge variant="secondary" className="ml-2">
                                      {player.position}
                                    </Badge>
                                  </Button>
                                ))}
                            </div>
                          </>
                        )}

                        {selectedPlayer && selectedSubstitute && (
                          <Button
                            className="w-full bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white transition-colors duration-300"
                            onClick={() => {
                              setSelectedPlayers(prev => {
                                const newSelectedPlayers = { ...prev };
                                const positionIndex = Object.entries(prev[selectedTeam])
                                  .find(([, playerId]) => playerId === selectedPlayer)?.[0];

                                if (positionIndex) {
                                  newSelectedPlayers[selectedTeam][parseInt(positionIndex)] = selectedSubstitute;
                                }
                                return newSelectedPlayers;
                              });
                              addEvent();
                            }}
                          >
                            Confirmar Sustitución
                          </Button>
                        )}
                      </div>
                    ) : (
                      // Lógica para otros eventos (goles, tarjetas)
                      <>
                        <Label>Seleccionar Jugador</Label>
                        <div className="grid grid-cols-2 gap-4">
                          {teamsState
                            .find(t => t.id === selectedTeam)
                            ?.players.filter(p => {
                              const isInFormation = Object.values(selectedPlayers[selectedTeam]).includes(p.id);
                              return isInFormation && p.status !== 'expelled' && p.status !== 'substituted';
                            })
                            .map((player) => (
                              <Button
                                key={player.id}
                                variant={selectedPlayer === player.id ? "default" : "outline"}
                                onClick={() => setSelectedPlayer(player.id)}
                                className={`${selectedPlayer === player.id
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                  } transition-colors duration-300`}
                              >
                                {player.number} - {player.name}
                                <Badge variant="secondary" className="ml-2">
                                  {player.position}
                                </Badge>
                              </Button>
                            ))}
                        </div>

                        {selectedPlayer && (
                          <Button
                            className="w-full bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white transition-colors duration-300"
                            onClick={addEvent}
                          >
                            Añadir Evento
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Penalty Shootout Controls */}
                {matchPhase === 'penaltyShootout' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Tanda de Penaltis</h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-900 dark:text-gray-100">Turno: {currentPenaltyTaker === 'home' ? teamsState[0].name : teamsState[1].name}</p>
                        <p className="text-gray-900 dark:text-gray-100">Ronda: {penaltyRound}/{totalPenalties}</p>
                      </div>
                      <div className="space-x-2">
                        <Button
                          onClick={() => handlePenaltyKick('scored')}
                          className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white"
                        >
                          Gol
                        </Button>
                        <Button
                          onClick={() => handlePenaltyKick('missed')}
                          className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white"
                        >
                          Fallado
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <h4 className="text-gray-900 dark:text-gray-100">{teamsState[0].name}</h4>
                        <div className="flex space-x-1">
                          {penaltyShootout.home.map((result, index) => (
                            <div
                              key={index}
                              className={`w-6 h-6 rounded-full ${result === 'scored' ? 'bg-green-500' :
                                result === 'missed' ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-gray-900 dark:text-gray-100">{teamsState[1].name}</h4>
                        <div className="flex space-x-1">
                          {penaltyShootout.away.map((result, index) => (
                            <div
                              key={index}
                              className={`w-6 h-6 rounded-full ${result === 'scored' ? 'bg-green-500' :
                                result === 'missed' ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Match Events */}
            <Card className="overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <img src={teamsState[0].logo} alt={teamsState[0].name} className="w-10 h-10" />
                      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{teamsState[0].name}</span>
                    </div>
                    <span className="text-3xl font-bold text-red-600 dark:text-red-400">{homeScore}</span>
                  </div>
                  <span className="text-xl text-gray-900 dark:text-gray-100">-</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold text-red-600 dark:text-red-400">{awayScore}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{teamsState[1].name}</span>
                      <img src={teamsState[1].logo} alt={teamsState[1].name} className="w-10 h-10" />
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {events.map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          "flex items-center p-4 rounded-lg",
                          'bg-gray-100 dark:bg-gray-800',
                          "group relative",
                          event.type === 'phase-change' ? 'justify-center' : event.type === 'inicio_partido' ? 'justify-center' : event.type === 'fin_partido' ? 'justify-center' : (event.team === 'home' ? 'justify-start' : 'justify-end')
                        )}
                      >
                        {event.type === 'phase-change' ? (
                          <span className="text-base font-medium text-gray-600 dark:text-gray-400">
                            {event.details}
                          </span>
                        ) : event.team === 'home' ? (
                          <>
                            {/* {event.type !== 'inicio_partido' && event.type !== 'fin_partido' && (
                              <Badge variant="outline" className="mr-3 text-base px-2 py-1 bg-red-100 dark:bg-red-800/20 text-red-800 dark:text-red-200">
                                {event.minute}'
                              </Badge>
                            )} */}
                            <div className="flex items-center gap-2">
                              {event.type === 'goal' && <Goal className="w-5 h-5 text-red-500 dark:text-red-400" />}
                              {event.type === 'yellow-card' && <div className="w-5 h-7 bg-yellow-400 dark:bg-yellow-500 rounded-sm" />}
                              {event.type === 'red-card' && <div className="w-5 h-7 bg-red-500 dark:bg-red-600 rounded-sm" />}
                              {event.type === 'second-yellow-card' && (
                                <div className="flex">
                                  <div className="w-5 h-7 bg-yellow-400 dark:bg-yellow-500 rounded-sm mr-1" />
                                  <div className="w-5 h-7 bg-red-500 dark:bg-red-600 rounded-sm" />
                                </div>
                              )}
                              {event.type === 'inicio_partido' && <p className="text-sm text-gray-500 dark:text-gray-400" >Inicio de partido</p>}
                              {event.type === 'goal_penalti' && <p className="text-base font-medium text-gray-900 dark:text-gray-100" >Gol Penalti</p>}
                              {event.type === 'fail_penalti' && <p className="text-base font-medium text-gray-900 dark:text-gray-100" >Fallo Gol Penalti</p>}
                              {event.type === 'substitution' && <ArrowRightLeft className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
                              {event.type === 'penalty' && <Goal className="w-5 h-5 text-purple-500 dark:text-purple-400" />}
                              <span className="text-base font-medium text-gray-900 dark:text-gray-100">{event.player}</span>
                              {event.details && <span className="text-sm text-gray-500 dark:text-gray-400">({event.details})</span>}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-medium text-gray-900 dark:text-gray-100">{event.player}</span>
                              {event.details && <span className="text-sm text-gray-500 dark:text-gray-400">({event.details})</span>}
                              {event.type === 'goal' && <Goal className="w-5 h-5 text-red-500 dark:text-red-400" />}
                              {event.type === 'yellow-card' && <div className="w-5 h-7 bg-yellow-400 dark:bg-yellow-500 rounded-sm" />}
                              {event.type === 'red-card' && <div className="w-5 h-7 bg-red-500 dark:bg-red-600 rounded-sm" />}
                              {event.type === 'second-yellow-card' && (
                                <div className="flex">
                                  <div className="w-5 h-7 bg-yellow-400 dark:bg-yellow-500 rounded-sm mr-1" />
                                  <div className="w-5 h-7 bg-red-500 dark:bg-red-600 rounded-sm" />
                                </div>
                              )}
                              {event.type === 'substitution' && <ArrowRightLeft className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
                              {event.type === 'penalty' && <Goal className="w-5 h-5 text-purple-500 dark:text-purple-400" />}
                              {event.type === 'inicio_partido' && <p className="text-sm text-gray-500 dark:text-gray-400" >Inicio de partido</p>}
                              {event.type === 'goal_penalti' && <p className="text-base font-medium text-gray-900 dark:text-gray-100" >Gol Penalti</p>}
                              {event.type === 'fail_penalti' && <p className="text-base font-medium text-gray-900 dark:text-gray-100" >Fallo Gol Penalti</p>}
                              {event.type === 'fin_partido' && <p className="text-sm text-gray-500 dark:text-gray-400" >Fin del partido</p>}
                            </div>
                            {/* {event.type !== 'inicio_partido' && event.type !== 'fin_partido' && (
                              <Badge variant="outline" className="ml-3 text-base px-2 py-1 bg-red-100 dark:bg-red-800/20 text-red-800 dark:text-red-200">
                                {event.minute}'
                              </Badge>
                            )} */}
                          </>
                        )}
                        {event.type !== 'phase-change' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEvent(event)}
                            className="opacity-0 group-hover:opacity-100 absolute right-2 transition-opacity duration-300"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {events.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No hay eventos registrados
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Soccer Field Layout */}
          <div className="mt-8">
            <Card className="w-full mx-auto bg-gray-100 dark:bg-gray-800">
              <CardContent className="p-8">
                <div className="flex flex-col space-y-4">
                  {/* Botones de guardar */}
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4">
                    <Button
                      variant="outline"
                      onClick={() => saveFormation()}
                      className="text-sm sm:text-base bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-black"
                    >
                      Guardar Alineación Local
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => save_Formation()}
                      className="text-sm sm:text-base bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-black"
                    >
                      Guardar Alineación Visitante
                    </Button>
                  </div>

                  {/* Header con equipos y formaciones */}
                  {/* Header con equipos y formaciones */}
                  <div className="mb-8">
                    <div className="flex justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <img src={teamsState[0].logo} alt={`${teamsState[0].name} logo`} className="w-8 h-8 sm:w-16 sm:h-16" />
                        <h2 className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{teamsState[0].name}</h2>
                      </div>
                      <div className="flex items-center gap-4">
                        <h2 className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{teamsState[1].name}</h2>
                        <img src={teamsState[1].logo} alt={`${teamsState[1].name} logo`} className="w-8 h-8 sm:w-16 sm:h-16" />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Select value={homeFormation} onValueChange={(value: Formation) => setHomeFormation(value)}>
                        <SelectTrigger className="w-[100px] sm:w-[150px] text-sm sm:text-lg">
                          <SelectValue placeholder="Formation" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(formations).map((formation) => (
                            <SelectItem key={formation} value={formation as Formation}>
                              {formation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={awayFormation} onValueChange={(value: Formation) => setAwayFormation(value)}>
                        <SelectTrigger className="w-[100px] sm:w-[150px] text-sm sm:text-lg">
                          <SelectValue placeholder="Formation" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(formations).map((formation) => (
                            <SelectItem key={formation} value={formation as Formation}>
                              {formation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 lg:mt-8"></div>
                <div className="relative w-full overflow-x-hidden" style={{ paddingBottom: '56.25%' }}>
                  <div
                    className="absolute inset-0 bg-green-600 dark:bg-green-700 border-2 border-white dark:border-gray-700 rounded-2xl overflow-hidden shadow-2xl"
                  >
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
          </div>
        </div>


        {/* Extra Time Dialog */}
        <Dialog open={showExtraTimeDialog} onOpenChange={setShowExtraTimeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Fin del Tiempo Regular</DialogTitle>
              <DialogDescription>
                El partido ha terminado en empate. ¿Qué deseas hacer?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleExtraTimeDecision(false)}>
                Ir a Penaltis
              </Button>
              <Button onClick={() => handleExtraTimeDecision(true)}>
                Jugar Prórroga
              </Button>
              <Button variant="secondary" onClick={finishMatch}>
                Finalizar Partidoxxx
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* End Match Dialog */}
        <Dialog open={showEndMatchDialog} onOpenChange={setShowEndMatchDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Fin de la Prórroga</DialogTitle>
              <DialogDescription>
                La prórroga ha terminado. ¿Qué deseas hacer?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleEndMatchDecision(false)}>
                Ir a Penaltis
              </Button>
              <Button onClick={() => handleEndMatchDecision(true)}>
                Finalizar Partidokkkk
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Penalty Shootout Dialog */}
        <Dialog open={showPenaltyShootoutDialog} onOpenChange={setShowPenaltyShootoutDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tanda de Penaltis</DialogTitle>
              <DialogDescription>
                ¿Deseas iniciar la tanda de penaltis?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => handlePenaltyShootoutDecision(false)}>
                Cancelar
              </Button>
              <Button onClick={() => handlePenaltyShootoutDecision(true)}>
                Iniciar Tanda de Penaltis
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Next Penalty Round Dialog */}
        <Dialog open={showNextPenaltyRoundDialog} onOpenChange={setShowNextPenaltyRoundDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Fin de la Tanda de Penaltis</DialogTitle>
              <DialogDescription>
                La tanda de penaltis ha terminado. ¿Deseas iniciar otra tanda o finalizar el partido?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleNextPenaltyRoundDecision(false)}>
                Finalizar Partidoqqqq
              </Button>
              <Button onClick={() => handleNextPenaltyRoundDecision(true)}>
                Iniciar Nueva Tanda
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ThemeProvider>
  )
}