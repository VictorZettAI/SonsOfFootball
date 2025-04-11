"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Link } from 'react-router-dom';
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sun, Moon, Trash2, Trophy } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import config from '../config';
import axiosInstance from '@/contexts/axiosConfig'
import { Check_Validation } from "@/contexts/cheking"


const initialTeams = [
  { id: '1', name: 'Brasil' },
  { id: '2', name: 'Argentina' },
  { id: '3', name: 'Francia' },
  { id: '4', name: 'Inglaterra' },
  { id: '5', name: 'España' },
  { id: '6', name: 'Alemania' },
  { id: '7', name: 'Portugal' },
  { id: '8', name: 'Bélgica' },
  { id: '9', name: 'Países Bajos' },
  { id: '10', name: 'Italia' },
  { id: '11', name: 'Croacia' },
  { id: '12', name: 'Uruguay' },
  { id: '13', name: 'Dinamarca' },
  { id: '14', name: 'Suiza' },
  { id: '15', name: 'Estados Unidos' },
  { id: '16', name: 'México' },
]

const initialTorneoData = {
  octavos: Array(8).fill(null).map((_, i) => ({
    id: null,
    equipo1: null,
    equipo2: null,
    resultado: "- - -",
    fecha: "2024-07-02",
    hora: "15:00",
    estadio: "Por determinar"
  })),
  cuartos: Array(4).fill(null).map((_, i) => ({
    id: null,
    equipo1: null,
    equipo2: null,
    resultado: "- - -",
    fecha: "2024-07-06",
    hora: "15:00",
    estadio: "Por determinar"
  })),
  semifinales: Array(2).fill(null).map((_, i) => ({
    id: null,
    equipo1: null,
    equipo2: null,
    resultado: "- - -",
    fecha: "2024-07-10",
    hora: "15:00",
    estadio: "Por determinar"
  })),
  tercerPuesto: [{
    id: null,
    equipo1: null,
    equipo2: null,
    resultado: "- - -",
    fecha: "2024-07-13",
    hora: "15:00",
    estadio: "Por determinar"
  }],
  final: [{
    id: null,
    equipo1: null,
    equipo2: null,
    resultado: "- - -",
    fecha: "2024-07-14",
    hora: "15:00",
    estadio: "Por determinar"
  }],
}

export default function TorneoBracketsMejorado() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState(initialTeams)
  const [torneoData, setTorneoData] = useState(initialTorneoData)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [sponsors, setSponsors] = useState([])
  const { id } = useParams();
  const [validado, setValidado] = useState(false)

  useEffect(() => {
    Check_Validation().then((variable) => {
      console.log(variable)
      setValidado(variable)
    })
  }, [])

  const Equiposos = (equipos) => {
    return equipos.map(equipo => {
      return {
        id: equipo.id,
        name: equipo.nombre
      };
    });
  };

  const DatosDelPartido = (partido) => ({
    id: partido[2].id,
    equipo1: {
      id: partido[0].id,
      name: partido[0].nombre,
      escudo: partido[0].escudo
    },
    equipo2: {
      id: partido[1].id,
      name: partido[1].nombre,
      escudo: partido[1].escudo
    },
    resultado: `${partido[2].marcador_1} - ${partido[2].marcador_2}`,
    fecha: partido[2].fecha,
    hora: partido[2].hora,
    estadio: partido[2].localizacion
  })

  const handleDeleteTorneo = async () => {
    try {
      const response = await axiosInstance.delete(`/torneo/mod/${id}/`);
      window.location.href = '/';

    } catch (error) {
      console.error('Error:', error);
    }
  };


  const handleFinalizarTorneo = async () => {
    try {
      const data = {
        finalizado: true
      }
      const response = await axiosInstance.patch(`/torneo/mod/${id}/`, data);
      navigate('/');
    } catch (error) {
      console.error('Error al finalizar el torneo:', error);
    }
  };
  const Ordenanza_partidos = (partidos) => {
    let paquete = {};
    let grupoActual = [];
    let elevacion = 0;

    const fases = ["final", "semifinales", "cuartos", "octavos", "dieciseisavos", "treintaidosavos"];
    let grupoIndex = 0;
    partidos.forEach((partido, i) => {
      if (i === 1) return;
      const datos_partido = DatosDelPartido(partido)
      grupoActual.push({ ...datos_partido });
      if (grupoActual.length === 2 ** elevacion) {
        const nombreGrupo = fases[grupoIndex] || `grupo_${grupoIndex + 1}`;
        paquete[nombreGrupo] = grupoActual;
        grupoActual = [];
        elevacion++;
        grupoIndex++;
      }
    });
    if (grupoActual.length > 0) {
      const nombreGrupo = fases[grupoIndex] || `grupo_${grupoIndex + 1}`;
      paquete[nombreGrupo] = grupoActual;
    }
    let paqueteInvertido = Object.keys(paquete)
      .reverse()
      .reduce((acc, key) => {
        acc[key] = paquete[key];
        return acc;
      }, {});

    return paqueteInvertido;
  };

  const fetchTorneoData = async () => {
    try {
      const response = await fetch(`${config.API_URL}/bracket/${id}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch tournament data');
      }
      const data = await response.json();
      const partidos_data = Ordenanza_partidos(data.bracket.bracket.slice(1))
      const equipos_data = Equiposos(data.equipos)
      setTorneoData(partidos_data)
      setTeams(equipos_data)
      setSponsors(data.patrocinadores || [])
    } catch (error) {
      console.error('Error fetching torneo data:', error);
    }
  };

  const actualizarPartido = async (match) => {
    let dataToUpdate = {};
    if (match.equipo1?.id) {
      dataToUpdate = { ...dataToUpdate, equipo_1: match.equipo1.id };
    }
    if (match.equipo2?.id) {
      dataToUpdate = { ...dataToUpdate, equipo_2: match.equipo2.id };
    }
    const equipos = [];
    if (match.equipo1?.id) {
      equipos.push(match.equipo1.id);
    }
    if (match.equipo2?.id) {
      equipos.push(match.equipo2.id);
    }
    if (equipos.length > 0) {
      dataToUpdate = { ...dataToUpdate, equipos };
    }
    if (match.estadio) {
      dataToUpdate = { ...dataToUpdate, localizacion: match.estadio };
    }
    if (match.fecha && match.hora) {
      const fecha_hora_str = `${match.fecha}T${match.hora}`;
      const fechaHora = new Date(fecha_hora_str);
      fechaHora.setHours(fechaHora.getHours() + 1);
      const fechaHoraJson = fechaHora.toISOString();

      dataToUpdate = {
        ...dataToUpdate,
        fecha_inicio: fechaHoraJson,
      };
    } else if (match.fecha && !match.hora) {
      const fecha = new Date(match.fecha);
      fecha.setHours(1, 0, 0, 0);
      const fechaJson = fecha.toISOString();

      dataToUpdate = {
        ...dataToUpdate,
        fecha_inicio: fechaJson,
      };
    }
    try {
      const response = await axiosInstance.patch(`/partidos/mod/${match.id}/`, dataToUpdate);
      const result = await response.data; // Obtén la respuesta en JSON
    } catch (error) {
      console.error('Error en la solicitud PATCH:', error);
    }
  };
  // useEffect para llamar fetchTorneoData al cargar el componente
  useEffect(() => {
    fetchTorneoData();
  }, []);


  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    setIsDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    document.documentElement.classList.toggle('dark', newDarkMode)
  }

  const updateMatch = (round, id, updatedMatch) => {
    setTorneoData(prevData => ({
      ...prevData,
      [round]: prevData[round].map(match =>
        match.id === id ? { ...match, ...updatedMatch } : match
      )
    }))
    actualizarPartido(updatedMatch)
  }

  const SponsorColumn = ({ sponsors, side }) => (
    <div className={`flex flex-col items-center space-y-4 w-24 md:w-32 lg:w-40 ${side === 'left' ? 'mr-2 md:mr-4' : 'ml-2 md:ml-4'}`}>
      {sponsors.map((sponsor, index) => (
        <motion.div
          key={sponsor.id}
          initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="w-full"
        >
          <Card className="bg-white/95 dark:bg-gray-800/95 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-2 flex flex-col items-center">
              <img src={sponsor.logo} alt={sponsor.nombre} className="w-full h-auto object-contain mb-1" />
              <p className="text-xs font-semibold text-center truncate w-full">{sponsor.nombre}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )

  // Divide sponsors into left and right groups
  const leftSponsors = sponsors.slice(0, Math.ceil(sponsors.length / 2))
  const rightSponsors = sponsors.slice(Math.ceil(sponsors.length / 2))


  const MatchCard = ({ match, round, index }) => {
    const [regularResult, penaltyResult] = match.resultado.split('(');
    const hasPenalty = !!penaltyResult;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="w-full"
      >
        <Card className="bg-white/95 dark:bg-gray-800/95 shadow-md hover:shadow-lg transition-all duration-300 hover:bg-white dark:hover:bg-gray-700 border-2 border-gray-400/50 dark:border-gray-500/50 shadow-[0_0_10px_rgba(71,85,105,0.2)] dark:shadow-[0_0_15px_rgba(71,85,105,0.3)] rounded-lg overflow-hidden">
          <CardContent className="p-1.5">
            <Button
              variant="ghost"
              className="w-full text-left p-0 text-gray-800 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              onClick={() => setSelectedMatch({ ...match, round })}
            >
              <div className="flex flex-col w-full text-[10px] space-y-1">
                {[match.equipo1, match.equipo2].map((equipo, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <img src={equipo.escudo || `/placeholder.svg?height=16&width=16&text=${equipo?.name?.charAt(0) || 'X'}`} alt={`Logo de ${equipo?.name || 'Equipo por determinar'}`} className="w-4 h-4 mr-1 rounded-full" />
                      <span className="font-semibold truncate">{equipo?.name?.includes('?') ? 'Sin definir' : equipo?.name || 'Sin definir'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-red-600 dark:text-red-400 font-bold text-xs mr-1">
                        {regularResult.split('-')[i]?.trim() || '-'}
                      </span>
                      {hasPenalty && i === 1 && (
                        <span className="text-orange-600 dark:text-orange-400 text-[8px]">
                          {penaltyResult.replace(')', '')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const MatchDialog = ({ match, isOpen, onClose }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{match?.round}</DialogTitle>
          <DialogDescription>
            <div className="mt-4">
              <Link to={`/Partido/${match?.id}/`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{match?.equipo1?.name || 'Por determinar'}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">vs</span>
                  <span className="font-semibold">{match?.equipo2?.name || 'Por determinar'}</span>
                </div>

                <div className="text-center mb-4">
                  <span className="text-lg font-bold">{match?.resultado}</span>
                </div>
              </Link>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <p>Fecha: {match?.fecha}</p>
                <p>Hora: {match?.hora}</p>
                <p>Estadio: {match?.estadio}</p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {validado && isEditing && (
            <Button onClick={() => setEditingMatch(match)}>Editar Partido</Button>
          )}
          {match?.empezado === false && match?.finalizado === false && (
            <Button
              onClick={() => window.location.href = `/Consola/${match.id}/`}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Iniciar Partido
            </Button>
          )}
          {match?.empezado === true && match?.finalizado === false && (
            <Button
              onClick={() => window.location.href = `/Consola/${match.id}/`}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continuar Partido
            </Button>
          )}
          {match?.finalizado === true && (
            <Button
              onClick={() => window.location.href = `/Partido/${match.id}/`}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Ver Resumen
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const EditMatchDialog = ({ match, isOpen, onClose }) => {
    const [editedMatch, setEditedMatch] = useState(match)

    const handleSave = () => {
      updateMatch(match.round, match.id, editedMatch)
      onClose()
    }

    const iniciateMatch = async (partidoId) => {
      await handleSave()
      try {
        const data = {
          empezado: true
        }
        const response = await axiosInstance.patch(`/partidos/mod/${partidoId}/`, data);
        navigate(`/Consola/${partidoId}/`)
      } catch (error) {
        console.error('Error completo:', error);
      }
      console.log(`Iniciar partido ${partidoId} clicked!`);
    }

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Partido</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="equipo1" className="text-right">
                Equipo 1
              </Label>
              <Select
                value={editedMatch?.equipo1?.id || ''}
                onValueChange={(value) => setEditedMatch({ ...editedMatch, equipo1: teams.find(team => team.id === value) })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar equipo" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="equipo2" className="text-right">
                Equipo 2
              </Label>
              <Select
                value={editedMatch?.equipo2?.id || ''}
                onValueChange={(value) => setEditedMatch({ ...editedMatch, equipo2: teams.find(team => team.id === value) })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar equipo" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fecha" className="text-right">
                Fecha
              </Label>
              <Input
                id="fecha"
                type="date"
                value={editedMatch?.fecha || ''}
                onChange={(e) => setEditedMatch({ ...editedMatch, fecha: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hora" className="text-right">
                Hora
              </Label>
              <Input
                id="hora"
                type="time"
                value={editedMatch?.hora || ''}
                onChange={(e) => setEditedMatch({ ...editedMatch, hora: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="estadio" className="text-right">
                Estadio
              </Label>
              <Input
                id="estadio"
                value={editedMatch?.estadio || ''}
                onChange={(e) => setEditedMatch({ ...editedMatch, estadio: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Guardar Cambios</Button>
            <Button onClick={() => iniciateMatch(match.id)}>
              Iniciar Partido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const sourceRound = result.source.droppableId;
    const destinationRound = result.destination.droppableId;
    const draggedMatchId = result.draggableId;

    if (sourceRound !== destinationRound) {
      // Mover equipo entre partidos
      const sourceMatch = torneoData[sourceRound].find(match => match.id === draggedMatchId);
      const destinationMatch = torneoData[destinationRound][result.destination.index];

      if (sourceMatch && destinationMatch) {
        const updatedSourceMatch = { ...sourceMatch, equipo1: null, equipo2: null };
        const updatedDestinationMatch = { ...destinationMatch };

        if (!updatedDestinationMatch.equipo1) {
          updatedDestinationMatch.equipo1 = sourceMatch.equipo1;
        } else if (!updatedDestinationMatch.equipo2) {
          updatedDestinationMatch.equipo2 = sourceMatch.equipo1;
        }

        setTorneoData({
          ...torneoData,
          [sourceRound]: torneoData[sourceRound].map(match =>
            match.id === updatedSourceMatch.id ? updatedSourceMatch : match
          ),
          [destinationRound]: torneoData[destinationRound].map(match =>
            match.id === updatedDestinationMatch.id ? updatedDestinationMatch : match
          ),
        });
      }
    }
  };

  const BracketView = () => {
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="w-full overflow-x-auto lg:overflow-x-visible">
          <div className="inline-flex lg:flex justify-center min-w-max lg:min-w-0 p-4">
            <div className="flex-1 relative overflow-hidden rounded-3xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
              <div className="relative z-10 flex flex-col lg:flex-row items-stretch p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/90 via-slate-800/80 to-slate-700/70">
                {Object.entries(torneoData).map(([round, matches], roundIndex) => (
                  <Droppable droppableId={round} key={round}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex-1 px-3 flex flex-col mb-8 lg:mb-0"
                      >
                        <h2 className="text-base font-semibold mb-4 text-center text-white bg">
                          {round === 'treintaidosavos' ? 'Treintaidosavos de Final' :
                            round === 'dieciseisavos' ? 'Dieciseisavos de Final' :
                              round === 'octavos' ? 'Octavos de Final' :
                                round === 'cuartos' ? 'Cuartos de Final' :
                                  round === 'semifinales' ? 'Semifinales' :
                                    round === 'tercerPuesto' ? 'Tercer Puesto' :
                                      round === 'final' ? 'Final' :
                                        'Final'}
                        </h2>
                        <div className={`flex-1 flex flex-col ${roundIndex === Object.keys(torneoData).length - 1 ? 'justify-center' : 'justify-around'}`}>
                          {matches.map((match, index) => (
                            <Draggable key={match.id} draggableId={match.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`flex items-center justify-center ${roundIndex === 0 ? 'mb-2' : ''}`}
                                >
                                  <div className={`w-full ${roundIndex === Object.keys(torneoData).length - 1 ? 'max-w-xs' : ''}`}>
                                    <MatchCard match={match} round={round} index={index} />
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DragDropContext>
    )
  }

  const MerchandisingItem = ({ image, name, price }) => (
    <div className="bg-white dark:bg-gray-700 p-2 rounded shadow">
      <img src={image} alt={name} className="w-full h-auto mb-2 rounded" />
      <p className="font-semibold">{name}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">${price}</p>
    </div>
  )

  return (
    <div className={`w-full px-4 py-8 bg-white dark:bg-gray-950 min-h-screen text-gray-900 dark:text-gray-100`}>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Brackets del Torneo Mundial 2024</h1>
        {validado && (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="edit-mode"
              checked={isEditing}
              onCheckedChange={setIsEditing}
            />
            <Label htmlFor="edit-mode">Modo Edición</Label>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Finalizar Torneo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción finalizará el torneo y no se podrá revertir. Se determinará el ganador basado en los resultados actuales.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleFinalizarTorneo}>Finalizar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Torneo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro que deseas eliminar este torneo?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el torneo y todos sus datos asociados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTorneo}>Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        )}
      </div>


      <div className="flex justify-center items-start">
        <SponsorColumn sponsors={leftSponsors} side="left" />

        <div className="flex-1 max-w-4xl">
          <BracketView />
        </div>

        <SponsorColumn sponsors={rightSponsors} side="right" />
      </div>


      <MatchDialog
        match={selectedMatch}
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />

      <EditMatchDialog
        match={editingMatch}
        isOpen={!!editingMatch}
        onClose={() => setEditingMatch(null)}
      />
    </div>
  )
}