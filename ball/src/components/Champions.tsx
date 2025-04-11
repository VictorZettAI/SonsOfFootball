"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Loader2, Trash2 } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import config from '../config';
import { toast } from "react-hot-toast";
import axiosInstance from '@/contexts/axiosConfig'
import { Check_Validation } from "@/contexts/cheking"
import { Link } from 'react-router-dom';

export default function Champions() {
  const navigate = useNavigate();
  const [torneoData, setTorneoData] = useState(null)
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [fasePlata, setFasePlata] = useState(false)
  const [clasificacionMode, setClasificacionMode] = useState('top2')
  const [topTeamsCount, setTopTeamsCount] = useState(16)
  const [currentPhase, setCurrentPhase] = useState(false)
  const { id } = useParams();

  const [showStartMatchDialog, setShowStartMatchDialog] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedTeam1, setSelectedTeam1] = useState('')
  const [selectedTeam2, setSelectedTeam2] = useState('')
  const [matchDate, setMatchDate] = useState('')
  const [matchTime, setMatchTime] = useState('')
  const [matchStadium, setMatchStadium] = useState('')
  const [bracketOro, setBracketOro] = useState([])
  const [bracketPlata, setBracketPlata] = useState(true)
  const [showMatchesDialog, setShowMatchesDialog] = useState(false)
  const [selectedGroupMatches, setSelectedGroupMatches] = useState([])
  const [selectedGroupName, setSelectedGroupName] = useState('')
  const [validado, setValidado] = useState(false)


  useEffect(() => {
    Check_Validation().then((variable) => {
      console.log(variable)
      setValidado(variable)
    })
  }, [])

  function esDiccionario(valor) {
    return valor && typeof valor === 'object' && !Array.isArray(valor) && valor !== null;
  }

  const Equiposos = (equipos) => {
    return equipos.map(equipo => {
      return {
        id: equipo.id,
        nombre: equipo.nombre
      };
    });
  };

  // Función para eliminar un torneo
  const handleDeleteTorneo = async () => {
    try {
      const response = await axiosInstance.delete(`/torneo/mod/${id}/`);
      toast.success('Torneo eliminado correctamente');
      navigate('/torneos');
    }
    catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar el torneo');
    }
  };

  const handleViewGroupMatches = (groupName) => {
    const group = torneoData?.champions?.liga_v2?.grupo.find(g => g.nombre === groupName);
    if (group && group.partido) {
      const formattedMatches = group.partido.map(p => ({
        id: p.id,
        equipo_1: {
          id: p.equipo_1.id,
          nombre: p.equipo_1.nombre,
          escudo: p.equipo_1.escudo
        },
        equipo_2: {
          id: p.equipo_2.id,
          nombre: p.equipo_2.nombre,
          escudo: p.equipo_2.escudo
        },
        marcador_1: p.marcador_1,
        marcador_2: p.marcador_2,
        fecha: p.fecha_inicio,
        hora: p.fecha_inicio,
        localizacion: p.localizacion,
        empezado: p.empezado,
        finalizado: p.finalizado
      }));

      setSelectedGroupMatches(formattedMatches);
      setSelectedGroupName(groupName);
      setShowMatchesDialog(true);
    }
  };

  // Modify this function to use 'partido' instead of 'match'
  const handleInitiateMatch = (partido) => {
    console.log("Iniciando partido:", partido);
    // Use the correct route format and ensure we're using the partido id
    window.location.href = `/Consola/${partido.id}/`;
  };

  const DatosDelPartido = (partido) => ({
    id: partido[2].id,
    equipo1: {
      id: partido[0].id,
      nombre: partido[0].nombre,
      escudo: partido[0].escudo
    },
    equipo2: {
      id: partido[1].id,
      nombre: partido[1].nombre,
      escudo: partido[1].escudo
    },
    resultado: `${partido[2].marcador_1} - ${partido[2].marcador_2}`,
    fecha: partido[2].fecha,
    hora: partido[2].hora,
    estadio: partido[2].localizacion
  })

  const Ordenanza_partidos = (partidos) => {
    if (!Array.isArray(partidos)) {
      return {};
    }

    let paquete = {};
    let grupoActual = [];
    let elevacion = 0;

    const fases = ["final", "semifinales", "cuartos", "octavos", "dieciseisavos", "treintaidosavos"];
    let grupoIndex = 0;

    partidos.forEach((partido, i) => {
      if (i === 1) return;
      const datos_partido = DatosDelPartido(partido);
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

  useEffect(() => {
    fetchTorneoData()
  }, [])

  const fetchTorneoData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${config.API_URL}/torneo/${id}/`)
      if (!response.ok) {
        throw new Error('Failed to fetch tournament data')
      }
      const data = await response.json()

      const equipos_data = Equiposos(data.equipos)
      setTorneoData(data)
      if (data.champions.plata !== null) {
        setFasePlata(data.champions.plata)
      }
      setTeams(equipos_data)
      console.log(data)
      if (data.champions.bracket && data.champions.bracket.length > 0) {
        setCurrentPhase(true)
        const partido_1 = Ordenanza_partidos(data.champions.bracket[0].bracket.slice(1))
        setBracketOro(partido_1)

        // Verificar específicamente el bracket de plata
        if (data.champions.bracket[1] && data.champions.bracket[1].bracket && data.champions.bracket[1].bracket.length > 1) {
          const partido_2 = Ordenanza_partidos(data.champions.bracket[1].bracket.slice(1))
          setBracketPlata(partido_2)
        } else {
          setBracketPlata(null)
        }
      } else {
        setCurrentPhase(false)
        setBracketOro(null)
        setBracketPlata(null)
      }
    } catch (error) {
      console.error('Error fetching torneo data:', error)
      setError('Failed to load tournament data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }
  const reiniciarFaseGrupos = async () => {
    try {
      const torneoId = torneoData?.champions?.liga_v2?.id;
      if (!torneoId) {
        throw new Error('No se encontró el ID de la liga');
      }
      const payload = {
        finalizado: false
      };
      const response = await axiosInstance.patch(`/torneo/liga/${torneoId}/`,
        payload
      );
      const responseData = await response.data;

      await fetchTorneoData();
      setCurrentPhase(false);
      setBracket([]);

    } catch (error) {
      console.error('Error al reiniciar:', error);
      setError('Error al reiniciar la fase de grupos. Por favor, inténtalo de nuevo.');
    }
  };

  const updateMatch = async (round, id, match) => {
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
      const fecha_hora_str = `${match.fecha}T${match.hora}Z`;
      const fechaHora = new Date(fecha_hora_str);
      fechaHora.setHours(fechaHora.getHours());
      console.log(fecha_hora_str)
      console.log(fechaHora)

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
      const response = await axiosInstance.patch(`/partidos/mod/${match.id}/`, dataToUpdate)
      await fetchTorneoData()
    } catch (error) {
      console.error('Error updating match:', error)
      setError('Failed to update match. Please try again.')
    }
  }

  const empezarTorneo = async () => {
    try {
      const torneoId = torneoData?.id;
      const payload = {
        empezado: true
      };
      const response = await axiosInstance.patch(`/torneo/mod/${torneoId}/`, payload)
      console.log(response)
      await fetchTorneoData()
    } catch (error) {
      console.error('Error comenzando tournament:', error)
      setError('Failed to inicio tournament. Please try again.')
    }
  }
  const finalizarTorneo = async () => {
    try {
      const torneoId = torneoData?.id;
      const payload = {
        finalizado: true
      };
      const response = await axiosInstance.patch(`/torneo/mod/${torneoId}/`, payload)
      console.log(response)
      await fetchTorneoData()
    } catch (error) {
      console.error('Error finalizing tournament:', error)
      setError('Failed to finalize tournament. Please try again.')
    }
  }

  const finalizarFaseGrupos = async () => {
    try {
      if (!torneoData?.champions?.liga_v2?.grupo) {
        throw new Error("No hay datos de grupos disponibles");
      }

      // Obtener todos los equipos ordenados
      const todosLosEquipos = torneoData.champions.liga_v2.grupo
        .flatMap(grupo => grupo.clasi)
        .sort((a, b) =>
          (b.puntos - a.puntos) ||
          (b.goles_f - b.goles_c) - (a.goles_f - a.goles_c)
        );
      console.log(todosLosEquipos)
      // Separar equipos para oro y plata
      let equiposOro = [];
      let equiposPlata = [];

      if (clasificacionMode === 'top2') {
        torneoData.champions.liga_v2.grupo.forEach(grupo => {
          if (!grupo.clasi) return;
          const equiposOrdenados = [...grupo.clasi].sort((a, b) =>
            (b.puntos - a.puntos) ||
            (b.goles_f - b.goles_c) - (a.goles_f - a.goles_c)
          );
          equiposOro.push(...equiposOrdenados.slice(0, 2).map(e => e.id));
          equiposPlata.push(...equiposOrdenados.slice(2).map(e => e.id));
        });
        console.log(equiposOro)
        console.log(equiposPlata)
      } else {
        equiposOro = todosLosEquipos
          .slice(0, topTeamsCount)
          .map(e => e.id);
        equiposPlata = todosLosEquipos
          .slice(topTeamsCount)
          .map(e => e.id);
        console.log(equiposOro)
        console.log(equiposPlata)
      }
      let payload = {}
      if (fasePlata) {
        payload = {
          finalizado: true,
          bracket_1: {
            equipo: equiposOro,
            finales: true
          },
          bracket_2: {
            equipo: equiposPlata,
            finales: false
          }
        };
      }
      else {
        payload = {
          finalizado: true,
          bracket_1: {
            equipo: equiposOro,
            finales: true
          }
        }
      }


      const response = await axiosInstance.patch(`/torneo/liga/${torneoData.champions.liga_v2.id}/`, payload);
      const responseData = await response.data;
      const data = {
        plata: fasePlata
      }
      const response_2 = await axiosInstance.patch(`/torneo/champions/${torneoData.champions.id}/`, data)
      await fetchTorneoData();
      setCurrentPhase(true);

    } catch (error) {
      console.error('Error:', error);
      setError('Error al finalizar la fase de grupos');
    }
  };

  const teamsAdvancing = useMemo(() => {
    if (!torneoData || !torneoData.champions || !torneoData.champions.liga_v2) return 0;

    if (clasificacionMode === 'top2') {
      return torneoData.champions.liga_v2.grupo.reduce((acc, group) => acc + Math.min(2, group.clasi.length), 0);
    } else {
      return topTeamsCount;
    }
  }, [torneoData, clasificacionMode, topTeamsCount]);

  const tournamentRounds = useMemo(() => {
    if (teamsAdvancing >= 17 && teamsAdvancing <= 32) {
      return ['dieciseisavos', 'octavos', 'cuartos', 'semifinales', 'final'];
    } else if (teamsAdvancing >= 9 && teamsAdvancing <= 16) {
      return ['octavos', 'cuartos', 'semifinales', 'final'];
    } else if (teamsAdvancing >= 5 && teamsAdvancing <= 8) {
      return ['cuartos', 'semifinales', 'final'];
    } else if (teamsAdvancing === 3 || teamsAdvancing === 4) {
      return ['semifinales', 'final'];
    } else {
      return ['final'];
    }
  }, [teamsAdvancing]);

  const startMatch = async (e) => {
    e.preventDefault();
    try {
      const grupo = torneoData.champions.liga_v2.grupo.find(g => g.nombre === selectedGroup);

      const equipo1 = torneoData.champions.liga_v2.grupo
        .find(g => g.nombre === selectedGroup)
        .clasi.find(e => e.nombre === selectedTeam1).id;

      const equipo2 = torneoData.champions.liga_v2.grupo
        .find(g => g.nombre === selectedGroup)
        .clasi.find(e => e.nombre === selectedTeam2).id;

      if (equipo1 === equipo2) {
        toast.error('No puedes seleccionar el mismo equipo');
        return;
      }

      const matchData = {
        equipo_1: equipo1,
        equipo_2: equipo2,
        equipos: [equipo1, equipo2],
        fecha_inicio: `${matchDate}T${matchTime}:00Z`,
        localizacion: matchStadium,
        liga_v2: torneoData.champions.liga_v2.id,
        grupo: grupo.id,
        marcador_1: 0,
        marcador_2: 0
      };

      const response = await axiosInstance.post(`/partido/create/`, matchData);

      toast.success('Partido creado exitosamente');
      await fetchTorneoData();
      setShowStartMatchDialog(false);
      setSelectedGroup('');
      setSelectedTeam1('');
      setSelectedTeam2('');
      setMatchDate('');
      setMatchTime('');
      setMatchStadium('');

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear el partido');
    }
  };



  const MatchCard = ({ match, round, index, fase = 'oro', equipos }) => {
    const isMatch = 'marcador_1' in match && 'marcador_2' in match
    const [regularResult, penaltyResult] = match.resultado?.split('(') || []
    const hasPenalty = !!penaltyResult
    const {
      marcador_1,
      marcador_2,
      ganador,
      empezado,
      finalizado,
      localizacion,
      fecha,
      hora,
    } = match

    // Solo mostrar puntos si el partido está finalizado
    const showPoints = finalizado && marcador_1 !== null && marcador_2 !== null
    const team1Points = showPoints ? (marcador_1 > marcador_2 ? 3 : marcador_1 === marcador_2 ? 1 : 0) : null
    const team2Points = showPoints ? (marcador_2 > marcador_1 ? 3 : marcador_1 === marcador_2 ? 1 : 0) : null
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="w-full"
      >
        <Card className={`bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-slate-700 border ${fase === 'oro' ? 'border-yellow-400' : 'border-gray-400'} rounded-lg overflow-hidden`}>
          <CardContent className="p-1.5">
            <Button
              variant="ghost"
              className="w-full text-left p-0 text-gray-800 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              onClick={() => setSelectedMatch({ ...match, round, equipos })}
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span>{match.equipo1?.nombre}</span>
                    <span className="font-bold">{showPoints ? `${marcador_1} (${team1Points}pts)` : marcador_1 ?? '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{match.equipo2?.nombre}</span>
                    <span className="font-bold">{showPoints ? `${marcador_2} (${team2Points}pts)` : marcador_2 ?? '-'}</span>
                  </div>
                </div>
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
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{match?.equipo1?.nombre}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">vs</span>
                <span className="font-semibold">{match?.equipo2?.nombre}</span>
              </div>
              <div className="text-center mb-4">
                <span className="text-lg font-bold">{match?.resultado}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <p>Fecha: {match?.fecha}</p>
                <p>Hora: {match?.hora}</p>
                <p>Estadio: {match?.estadio}</p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        {validado && isEditing && (
          <DialogFooter>
            <Button onClick={() => setEditingMatch(match)}>Editar Resultado</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )

  const EditMatchDialog = ({ match, isOpen, onClose }) => {
    const [editedMatch, setEditedMatch] = useState(match)
    console.log(match)
    console.log(editedMatch)
    console.log(teams)
    const handleSave = () => {
      updateMatch(match.round, match.id, editedMatch)
      onClose()
    }

    const iniciateMatch = async (partidoId) => {
      await handleSave()
      const body = {
        empezado: true
      }
      try {
        const response = await axiosInstance.patch(`/partidos/mod/${partidoId}/`, body);
        const texto = await response.data
        console.log(texto)
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
            <DialogTitle className="text-xl font-semibold">Editar Partido</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="equipo1" className="text-right">Equipo 1</Label>
              <Select
                value={editedMatch?.equipo1?.id || ''}
                onValueChange={(value) => setEditedMatch({ ...editedMatch, equipo1: teams.find(team => team.id === value) })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar equipo" />
                </SelectTrigger >
                <SelectContent>
                  {match?.equipos?.map((team) => (
                    <SelectItem key={team.id} value={team.id}>{team.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="equipo2" className="text-right">Equipo 2</Label>
              <Select
                value={editedMatch?.equipo2?.id || ''}
                onValueChange={(value) => setEditedMatch({ ...editedMatch, equipo2: teams.find(team => team.id === value) })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar equipo" />
                </SelectTrigger>
                <SelectContent>
                  {match?.equipos?.map((team) => (
                    <SelectItem key={team.id} value={team.id}>{team.nombre}</SelectItem>
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

          <div className="flex justify-end gap-2 mt-6">
            <Button
              onClick={handleSave}
              className="bg-black text-white hover:bg-gray-100"
            >
              Guardar Cambios
            </Button>
            <Button
              onClick={() => iniciateMatch(match.id)}
              className="bg-black text-white hover:bg-gray-100"
            >
              Iniciar Partido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Reemplaza el StartMatchDialog actual con esto:
  const StartMatchDialog = () => {
    const handleCreateMatch = () => {
      // Cerrar el diálogo antes de navegar
      setShowStartMatchDialog(false);

      console.log("Datos a enviar:", {
        torneoId: torneoData.id,
        ligaV2Id: torneoData.champions.liga_v2.id,
        grupos: torneoData.champions.liga_v2.grupo,
      });

      // Navegar a CrearPartido con los datos necesarios
      navigate('/Crear/Partido', {
        state: {
          torneoId: torneoData.id,
          ligaV2Id: torneoData.champions.liga_v2.id,
          grupos: torneoData.champions.liga_v2.grupo,
          fromChampions: true
        }
      });
    };

    return (
      <Dialog open={showStartMatchDialog} onOpenChange={setShowStartMatchDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Partido</DialogTitle>
            <DialogDescription>
              ¿Desea crear un nuevo partido?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCreateMatch}>
              Ir a Crear Partido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const GroupMatchesDialog = () => (
    <Dialog open={showMatchesDialog} onOpenChange={setShowMatchesDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Partidos del Grupo {selectedGroupName}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          {selectedGroupMatches.map((partido, index) => (
            <div key={partido.id} className="mb-4 p-2 border rounded dark:border-gray-700 dark:bg-gray-800">
              <Link to={`/Partido/${partido.id}`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <img src={partido.equipo_1.escudo || `/placeholder.svg?height=24&width=24&text=${partido.equipo_1.nombre.charAt(0)}`} alt={partido.equipo_1.nombre} className="w-6 h-6 mr-2" />
                    <span className="dark:text-gray-100">{partido.equipo_1.nombre}</span>
                  </div>
                  {(partido.marcador_1 !== null && partido.marcador_2 !== null) ? (
                    <span className="font-bold dark:text-gray-100">{partido.marcador_1} - {partido.marcador_2}</span>
                  ) : (
                    <span className="dark:text-gray-100">vs</span>
                  )}
                  <div className="flex items-center">
                    <span className="dark:text-gray-100">{partido.equipo_2.nombre}</span>
                    <img src={partido.equipo_2.escudo || `/placeholder.svg?height=24&width=24&text=${partido.equipo_2.nombre.charAt(0)}`} alt={partido.equipo_2.nombre} className="w-6 h-6 ml-2" />
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {partido.fecha ? new Date(partido.fecha).toLocaleDateString() : 'Fecha por determinar'}
                  {partido.hora ? new Date(partido.hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </Link>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {partido.localizacion || 'Estadio por determinar'}
              </div>
              {validado && !partido.finalizado && (
                <Button
                  onClick={() => handleInitiateMatch(partido)}
                  className="w-full"
                >
                  Iniciar Partidox
                </Button>
              )}
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );

  const GruposView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {torneoData?.champions?.liga_v2?.grupo.map((grupo) => (
        <motion.div
          key={grupo.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-red-600 text-white p-2 font-semibold text-center flex justify-between items-center">
                <span>Grupo {grupo.nombre}</span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewGroupMatches(grupo.nombre)}
                  >
                    Ver Partidos
                  </Button>
                </div>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-red-100 dark:bg-red-800">
                    <th className="p-2 text-left">Equipo</th>
                    <th className="p-2 text-center">PJ</th>
                    <th className="p-2 text-center">Pts</th>
                    <th className="p-2 text-center">GF</th>
                    <th className="p-2 text-center">GC</th>
                  </tr>
                </thead>
                <tbody>
                  {grupo.clasi.map((equipo, index) => {
                    // Calcular partidos jugados (solo finalizados)
                    const partidosJugados = grupo.partido?.filter(
                      p => p.finalizado && (p.equipo_1.id === equipo.id || p.equipo_2.id === equipo.id)
                    ).length || 0;

                    // Calcular puntos solo de partidos finalizados
                    const puntos = grupo.partido?.reduce((total, p) => {
                      if (!p.finalizado) return total;
                      if (p.equipo_1.id === equipo.id) {
                        if (p.marcador_1 > p.marcador_2) return total + 3;
                        if (p.marcador_1 === p.marcador_2) return total + 1;
                      }
                      if (p.equipo_2.id === equipo.id) {
                        if (p.marcador_2 > p.marcador_1) return total + 3;
                        if (p.marcador_1 === p.marcador_2) return total + 1;
                      }
                      return total;
                    }, 0) || 0;

                    // Calcular goles solo de partidos finalizados
                    const { golesFavor, golesContra } = grupo.partido?.reduce((acc, p) => {
                      if (!p.finalizado) return acc;
                      if (p.equipo_1.id === equipo.id) {
                        acc.golesFavor += p.marcador_1 || 0;
                        acc.golesContra += p.marcador_2 || 0;
                      }
                      if (p.equipo_2.id === equipo.id) {
                        acc.golesFavor += p.marcador_2 || 0;
                        acc.golesContra += p.marcador_1 || 0;
                      }
                      return acc;
                    }, { golesFavor: 0, golesContra: 0 }) || { golesFavor: 0, golesContra: 0 };

                    return (
                      <motion.tr
                        key={equipo.id}
                        className={`
                          ${index % 2 === 0 ? 'bg-white dark:bg-slate-700' : 'bg-red-50 dark:bg-slate-800'}
                          ${index < 2 ? 'border-l-4 border-red-500' : ''}
                        `}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <td className="p-2 flex items-center">
                          {index < 2 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Trophy className="w-4 h-4 text-red-500 mr-2" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Avanza a la siguiente fase</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {equipo.nombre}
                        </td>
                        <td className="p-2 text-center">{partidosJugados}</td>
                        <td className="p-2 text-center">{puntos}</td>
                        <td className="p-2 text-center">{golesFavor}</td>
                        <td className="p-2 text-center">{golesContra}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const BracketView = (datos) => {
    console.log(torneoData)
    let equipos = null
    if (torneoData?.champions?.bracket[0]?.finales){
      equipos = torneoData.champions.bracket[0].equipo
    }
    else if (torneoData?.champions?.bracket[1]?.finales){
      equipos = torneoData.champions.bracket[1].equipo
    }
    return (
      <div className="w-full overflow-x-auto lg:overflow-x-visible">
        <div className="inline-flex lg:flex justify-center min-w-max lg:min-w-0 p-4">
          <div className="flex-1 relative overflow-hidden rounded-3xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"></div>
            <div className="relative z-10 flex flex-col lg:flex-row items-stretch p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900/90 via-gray-800/80 to-gray-700/70">

              {esDiccionario(datos.data) && Object.entries(datos.data).map(([round, matches], roundIndex) => {
                return (
                  <div key={round} className="flex-1 px-3 flex flex-col mb-8 lg:mb-0">
                    <h2 className="text-lg font-bold mb-4 text-center text-white bg-gray-800/60 py-2 px-4 rounded-full shadow-sm inline-block">
                      {round === 'dieciseisavos' ? 'Dieciseisavos de Final' :
                        round === 'octavos' ? 'Octavos de Final' :
                          round === 'cuartos' ? 'Cuartos de Final' :
                            round === 'semifinales' ? 'Semifinales' :
                              'Final'}
                    </h2>
                    <div className={`flex-1 flex flex-col ${roundIndex === tournamentRounds.length - 1 ? 'justify-center' : 'justify-around'}`}>
                      {matches.map((bracket, index) => (
                        <div key={`${round}-${index}`} className={`flex items-center justify-center ${roundIndex === 0 ? 'mb-2' : ''}`}>
                          <div className={`w-full ${roundIndex === tournamentRounds.length - 1 ? 'max-w-xs' : ''}`}>
                            <MatchCard match={bracket} round={round} index={index} equipos = {equipos}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }) || <p>Sin datos disponibles</p>}
            </div>
          </div>
        </div>
        {teamsAdvancing > 4 && torneoData?.champions?.bracket.find(b => b.finales === 0) && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Tercer Puesto</h2>
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <MatchCard match={torneoData.champions.bracket.find(b => b.finales === 0)} round="Tercer Puesto" index={0} equipos = {equipos} />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const RankingView = () => {
    // Calcular puntos y estadísticas solo de partidos finalizados
    const allTeams = torneoData?.champions?.liga_v2?.grupo.flatMap(grupo => {
      return grupo.clasi.map(equipo => {
        // Calcular estadísticas solo de partidos finalizados
        const stats = grupo.partido?.reduce((acc, p) => {
          if (!p.finalizado) return acc;

          if (p.equipo_1.id === equipo.id) {
            acc.goles_f += p.marcador_1 || 0;
            acc.goles_c += p.marcador_2 || 0;
            if (p.marcador_1 > p.marcador_2) acc.puntos += 3;
            else if (p.marcador_1 === p.marcador_2) acc.puntos += 1;
          }
          if (p.equipo_2.id === equipo.id) {
            acc.goles_f += p.marcador_2 || 0;
            acc.goles_c += p.marcador_1 || 0;
            if (p.marcador_2 > p.marcador_1) acc.puntos += 3;
            else if (p.marcador_1 === p.marcador_2) acc.puntos += 1;
          }
          return acc;
        }, { puntos: 0, goles_f: 0, goles_c: 0 }) || { puntos: 0, goles_f: 0, goles_c: 0 };

        return {
          ...equipo,
          ...stats
        };
      });
    }).sort((a, b) =>
      b.puntos - a.puntos ||
      (b.goles_f - b.goles_c) - (a.goles_f - a.goles_c)
    );

    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Clasificación General</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-red-100 dark:bg-red-800">
                <th className="p-2 text-left">Pos</th>
                <th className="p-2 text-left">Equipo</th>
                <th className="p-2 text-center">PJ</th>
                <th className="p-2 text-center">Pts</th>
                <th className="p-2 text-center">GF</th>
                <th className="p-2 text-center">GC</th>
                <th className="p-2 text-center">Dif</th>
              </tr>
            </thead>
            <tbody>
              {allTeams?.map((equipo, index) => {
                const partidosJugados = torneoData?.champions?.liga_v2?.grupo
                  .find(g => g.clasi.some(e => e.id === equipo.id))
                  ?.partido?.filter(p => p.finalizado && (p.equipo_1.id === equipo.id || p.equipo_2.id === equipo.id))
                  .length || 0;

                return (
                  <tr key={equipo.id} className={`
                    ${index % 2 === 0 ? 'bg-white dark:bg-slate-700' : 'bg-red-50 dark:bg-slate-800'}
                    ${(clasificacionMode === 'top2' && index < 2) || (clasificacionMode === 'topX' && index < topTeamsCount) ? 'border-l-4 border-red-500' : ''}
                  `}>
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2 flex items-center">
                      {((clasificacionMode === 'top2' && index < 2) || (clasificacionMode === 'topX' && index < topTeamsCount)) && (
                        <Trophy className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      {equipo.nombre}
                    </td>
                    <td className="p-2 text-center">{partidosJugados}</td>
                    <td className="p-2 text-center">{equipo.puntos}</td>
                    <td className="p-2 text-center">{equipo.goles_f}</td>
                    <td className="p-2 text-center">{equipo.goles_c}</td>
                    <td className="p-2 text-center">{equipo.goles_f - equipo.goles_c}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-red-600 dark:text-red-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Cargando datos del torneo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={fetchTorneoData} className="bg-red-600 hover:bg-red-700 text-white">
            Intentar de nuevo
          </Button>
        </div>
      </div>
    )
  }

  if (!torneoData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No se encontraron datos del torneo.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="w-full px-4 py-8 text-gray-900 dark:text-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <motion.h1
            className="text-3xl font-bold mb-4 sm:mb-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {torneoData.nombre}
          </motion.h1>
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
                  <Button variant="destructive" className="flex items-center">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar Champions
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
        {validado && torneoData.champions.plata === null && (
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center space-x-2">
              <Switch
                id="fase-plata"
                checked={fasePlata}
                onCheckedChange={setFasePlata}
              />
              <Label htmlFor="fase-plata">Fase de Plata</Label>
            </div>
            <div className="flex gap-4 items-center">
              <Select value={clasificacionMode} onValueChange={setClasificacionMode}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Modo de clasificación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top2">2 mejores de cada grupo</SelectItem>
                  <SelectItem value="topX">X mejores del total</SelectItem>
                </SelectContent>
              </Select>
              {clasificacionMode === 'topX' && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="topX">Cantidad:</Label>
                  <Input
                    id="topX"
                    type="number"
                    value={topTeamsCount}
                    onChange={(e) => setTopTeamsCount(Number(e.target.value))}
                    className="w-20"
                    min={1}
                    max={32}
                  />
                </div>
              )}
            </div>
            <Button onClick={() => setShowStartMatchDialog(true)} className="bg-red-600 hover:bg-red-700 text-white">
              Crear Partido
            </Button>
          </div>
        )}
      </div>
      <Tabs defaultValue="grupos" className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-2 bg-gray-200 dark:bg-slate-800">
          <TabsTrigger value="grupos" className="data-[state=active]:bg-red-500 dark:data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Fase de Grupos
          </TabsTrigger>
          <TabsTrigger value="brackets" className="data-[state=active]:bg-red-500 dark:data-[state=active]:bg-red-600 data-[state=active]:text-white" disabled={currentPhase === false}>
            Fase Eliminatoria
          </TabsTrigger>
        </TabsList>
        <AnimatePresence mode="sync">
          <TabsContent value="grupos" key="grupos">
            <motion.div
              key="grupos-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <GruposView />
              <RankingView />
            </motion.div>
          </TabsContent>
          <TabsContent value="brackets">
            <motion.div
              key="brackets"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <BracketView data={bracketOro} />
              {fasePlata && bracketPlata && Object.keys(bracketPlata).length > 0 ? (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-4 text-center">Fase de Plata</h2>
                  <div className="w-full overflow-x-auto lg:overflow-x-visible">
                    <div className="inline-flex lg:flex justify-center min-w-max lg:min-w-0 p-4">
                      <div className="flex-1 relative overflow-hidden rounded-3xl shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"></div>
                        <div className="relative z-10 flex flex-col lg:flex-row items-stretch p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/90 via-slate-800/80 to-slate-700/70">
                          {Object.entries(bracketPlata).map(([round, matches], roundIndex) => (
                            <div key={round} className="flex-1 px-3 flex flex-col mb-8 lg:mb-0">
                              <h2 className="text-lg font-bold mb-4 text-center text-white bg-gray-800/60 py-2 px-4 rounded-full shadow-sm inline-block">
                                {round === 'dieciseisavos' ? 'Dieciseisavos de Final' :
                                  round === 'octavos' ? 'Octavos de Final' :
                                    round === 'cuartos' ? 'Cuartos de Final' :
                                      round === 'semifinales' ? 'Semifinales' :
                                        'Final'}
                              </h2>
                              <div className={`flex-1 flex flex-col ${roundIndex === tournamentRounds.length - 1 ? 'justify-center' : 'justify-around'}`}>
                                {matches.map((bracket, index) => (
                                  <div key={`${round}-${index}`} className={`flex items-center justify-center ${roundIndex === 0 ? 'mb-2' : ''}`}>
                                    <div className={`w-full ${roundIndex === tournamentRounds.length - 1 ? 'max-w-xs' : ''}`}>
                                      <MatchCard match={bracket} round={round} index={index} fase="plata" 
                                      equipos = {torneoData?.champions?.bracket[0]?.finales === false 
                                        ? torneoData.champions.bracket[0].equipo 
                                        : torneoData?.champions?.bracket[1]?.finales === false 
                                        ? torneoData.champions.bracket[1].equipo 
                                        : null}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-12 text-center text-gray-500">
                  No hay datos disponibles para la fase de plata
                </div>
              )}
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
      {validado && !torneoData.empezado && (
        <div className="flex justify-center mt-8 pb-8">
          <Button
            onClick={empezarTorneo}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Comenzar Torneo
          </Button>
        </div>
      )}
      {validado && torneoData.empezado && !torneoData.finalizado && (
        <div className="flex justify-center mt-8 pb-8">
          <Button
            onClick={currentPhase ? finalizarTorneo : finalizarFaseGrupos}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {currentPhase ? "Finalizar Torneo" : "Finalizar Fase de Grupos"}
          </Button>
        </div>
      )}
      <MatchDialog
        match={selectedMatch}
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />
      <GroupMatchesDialog />
      <EditMatchDialog
        match={editingMatch}
        isOpen={!!editingMatch}
        onClose={() => setEditingMatch(null)}
      />

      <StartMatchDialog />
    </div>

  )
}