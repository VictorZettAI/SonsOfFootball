import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PlusCircle } from 'lucide-react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from "react-hot-toast"
import config from '../config';
import axiosInstance from '@/contexts/axiosConfig'

export default function CreateMatch() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Datos que pueden venir de Champions o de Liga
  const ligaId = searchParams.get('ligaId');
  const { torneoId, ligaV2Id, grupos, fromChampions } = location.state || {};
  
  // Verificar datos recibidos
  useEffect(() => {
    console.log("Estado recibido:", location.state);
    if (fromChampions && (!torneoId || !ligaV2Id || !grupos)) {
      console.error("Faltan datos necesarios:", { torneoId, ligaV2Id, grupos });
      toast.error('Faltan datos necesarios del torneo');
      navigate(-1);
      return;
    }
  }, [fromChampions, torneoId, ligaV2Id, grupos]);

  const [matchData, setMatchData] = useState({
    team1: '',
    team2: '',
    date: '',
    time: '',
    venue: '',
    round: '',
    group: ''
  });

  const [teams, setTeams] = useState<{id: number, nombre: string}[]>([]);
  const [rounds, setRounds] = useState<{id: number, nombre: string}[]>([]);
  const [availableTeams, setAvailableTeams] = useState<{id: number, nombre: string}[]>([]);

  useEffect(() => {
    if (fromChampions && grupos) {
      const selectedGroup = grupos.find(g => g.nombre === matchData.group);
      if (selectedGroup) {
        setAvailableTeams(selectedGroup.clasi.map(team => ({
          id: team.id,
          nombre: team.nombre
        })));
      }
    } else if (ligaId) {
      const fetchData = async () => {
        try {
          const [equiposRes, ligaRes] = await Promise.all([
            fetch(`${config.API_URL}/api/liga/${ligaId}/equipos/`),
            fetch(`${config.API_URL}/api/liga/${ligaId}/`)
          ]);

          if (!equiposRes.ok || !ligaRes.ok) {
            throw new Error('Error al cargar datos');
          }

          const equiposData = await equiposRes.json();
          const ligaData = await ligaRes.json();

          setTeams(equiposData);
          setAvailableTeams(equiposData);
          setRounds(ligaData.jornada);
        } catch (err) {
          console.error("Error:", err);
          toast.error("Error al cargar datos");
          navigate(-1);
        }
      };

      fetchData();
    }
  }, [ligaId, fromChampions, grupos, matchData.group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (fromChampions && (!torneoId || !ligaV2Id)) {
        throw new Error('Faltan datos necesarios del torneo');
      }

      const matchPayload = fromChampions ? {
        equipo_1: parseInt(matchData.team1),
        equipo_2: parseInt(matchData.team2),
        equipos: [parseInt(matchData.team1), parseInt(matchData.team2)],
        fecha_inicio: `${matchData.date}T${matchData.time}:00Z`,
        localizacion: matchData.venue,
        liga_v2: ligaV2Id,
        grupo: grupos.find(g => g.nombre === matchData.group)?.id,
        marcador_1: null,
        marcador_2: null,
        torneo: torneoId,
        empezado: false,
        finalizado: false
      } : {
        equipo_1: parseInt(matchData.team1),
        equipo_2: parseInt(matchData.team2),
        fecha_inicio: `${matchData.date}T${matchData.time}`,
        localizacion: matchData.venue,
        jornada: parseInt(matchData.round),
        liga: parseInt(ligaId!)
      };

      const response = await axiosInstance.post(`/partido/create/`, matchPayload);
      toast.success('Partido creado exitosamente');
      
      if (fromChampions) {
        navigate(`/Champions/${torneoId}`);
      } else {
        navigate(`/Liga/${ligaId}/`);
      }
    } 
    catch (error) {
      console.error('Error al crear partido:', error);
      toast.error('Error al crear el partido');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <main className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto mt-40">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <PlusCircle className="h-6 w-6 text-red-500" />
              Crear Partido {fromChampions ? 'de Champions' : 'de Liga'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {fromChampions && (
                <div className="space-y-2">
                  <Label htmlFor="group">Grupo</Label>
                  <Select
                    value={matchData.group}
                    onValueChange={(value) => setMatchData(prev => ({...prev, group: value, team1: '', team2: ''}))}
                  >
                    <SelectTrigger id="group">
                      <SelectValue placeholder="Seleccionar Grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {grupos?.map((grupo) => (
                        <SelectItem key={grupo.id} value={grupo.nombre}>
                          Grupo {grupo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="team1">Equipo 1</Label>
                  <Select
                    value={matchData.team1}
                    onValueChange={(value) => setMatchData(prev => ({...prev, team1: value}))}
                  >
                    <SelectTrigger id="team1">
                      <SelectValue placeholder="Seleccionar Equipo 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team2">Equipo 2</Label>
                  <Select
                    value={matchData.team2}
                    onValueChange={(value) => setMatchData(prev => ({...prev, team2: value}))}
                  >
                    <SelectTrigger id="team2">
                      <SelectValue placeholder="Seleccionar Equipo 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeams
                        .filter(team => team.id.toString() !== matchData.team1)
                        .map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.nombre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={matchData.date}
                    onChange={(e) => setMatchData(prev => ({...prev, date: e.target.value}))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={matchData.time}
                    onChange={(e) => setMatchData(prev => ({...prev, time: e.target.value}))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Lugar</Label>
                  <Input
                    id="venue"
                    value={matchData.venue}
                    onChange={(e) => setMatchData(prev => ({...prev, venue: e.target.value}))}
                    placeholder="Estadio o Lugar"
                    required
                  />
                </div>
              </div>

              {!fromChampions && (
                <div className="space-y-2">
                  <Label htmlFor="round">Jornada</Label>
                  <Select
                    value={matchData.round}
                    onValueChange={(value) => setMatchData(prev => ({...prev, round: value}))}
                  >
                    <SelectTrigger id="round">
                      <SelectValue placeholder="Seleccionar Jornada" />
                    </SelectTrigger>
                    <SelectContent>
                      {rounds.map((round) => (
                        <SelectItem key={round.id} value={round.id.toString()}>
                          {round.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={!matchData.team1 || !matchData.team2 || !matchData.date || !matchData.time || !matchData.venue || 
                  (fromChampions ? !matchData.group : !matchData.round)}
              >
                Crear Partido
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}