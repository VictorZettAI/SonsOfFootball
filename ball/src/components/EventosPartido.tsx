'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from 'lucide-react'
import { EventIcons } from '@/utils/event-icons'

interface Evento {
  id: number;
  tipo: string;
  equipo: string;
  jugador: {
    nombre: string;
  };
  jugador_2?: {
    nombre: string;
  };
  hora: string;
  details?: string;
  logo?: string;
}

interface EventosProps {
  partidoId: Evento[];
  home: number;
  currentMatchTime: string;
}

const EventosPartido: React.FC<EventosProps> = ({ partidoId, home, currentMatchTime }) => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchEventos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Asegurarse de que partidoId sea un array
        setEventos(Array.isArray(partidoId) ? partidoId : []);
      } catch (err) {
        console.error('Error al procesar eventos:', err);
        setError('Error al cargar los eventos');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventos();
  }, [partidoId]);

  const getEventIcon = (tipo: string) => {
    const iconProps = { className: "h-5 w-5", strokeWidth: 1.5 };
    switch (tipo) {
      case 'goal':
        return <EventIcons.Goal {...iconProps} className="text-emerald-500" />;
      case 'yellow-card':
        return <EventIcons.YellowCard {...iconProps} className="text-amber-500" />;
      case 'red-card':
        return <EventIcons.RedCard {...iconProps} className="text-red-500" />;
      case 'second-yellow-card':
        return <EventIcons.SecondYellowCard {...iconProps} className="text-red-500" />;
      case 'substitution':
        return <EventIcons.Substitution {...iconProps} className="text-sky-500" />;
      case 'penalty':
        return <EventIcons.Penalty {...iconProps} className="text-rose-500" />;
      case 'phase-change':
        return <EventIcons.PhaseChange {...iconProps} className="text-gray-500" />;
      default:
        return <EventIcons.Default {...iconProps} className="text-slate-500" />;
    }
  };

  const getEventText = (evento: Evento) => {
    const teamLogo = evento.logo ? (
      <img
        src={evento.logo}
        alt="Team Logo"
        width={20}
        height={20}
        className="inline-block mx-1 rounded-full"
      />
    ) : null;

    switch (evento.tipo) {
      case 'substitution':
        return (
          <span>
            {Number(evento.equipo) !== home && teamLogo}
            {evento.jugador_2?.nombre} entra por {evento.jugador.nombre}
            {Number(evento.equipo) === home && teamLogo}
          </span>
        );
      case 'goal':
        return (
          <span>
            {Number(evento.equipo) !== home && teamLogo}
            ¡GOL! {evento.jugador.nombre}
            {Number(evento.equipo) === home && teamLogo}
          </span>
        );
      case 'yellow-card':
      case 'red-card':
      case 'second-yellow-card':
      case 'penalty':
        return (
          <span>
            {Number(evento.equipo) !== home && teamLogo}
            {evento.jugador.nombre}
            {Number(evento.equipo) === home && teamLogo}
          </span>
        );
      case 'inicio_partido':
        return (
          <span>
            Inicio del partido
          </span>
        );
      case 'fin_partido':
        return (
          <span>
            Final del partido
          </span>
        );
      case 'phase-change':
        return evento.details || 'Cambio de fase';
      default:
        return (
          <span>
            {Number(evento.equipo) !== home && teamLogo}
            {evento.tipo} {evento.jugador ? `- ${evento.jugador.nombre}` : ''}
            {Number(evento.equipo) === home && teamLogo}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 dark:text-red-400">Error: {error}</div>;
  }

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Trophy className="h-5 w-5 text-red-500" />
          Eventos del Partido
        </CardTitle>
      </CardHeader>
      <CardContent>
        {eventos.length === 0 ? (
          <p className="text-center text-slate-600 dark:text-slate-400 py-4">
            No hay eventos registrados
          </p>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {eventos.map((evento) => (
                <motion.div
                  key={evento.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                >
                  {Number(evento.equipo) === 0 ? (
                    <div className="flex items-center w-full justify-center">
                    <div className="flex-grow text-center ml-2">
                      <p className="text-slate-900 dark:text-slate-100">
                        {getEventText(evento)}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {currentMatchTime}
                      </p>
                    </div>
                  </div>
                  ) : (
                  (Number(evento.equipo) === home ? (
                    <div className="flex items-center w-full justify-start">
                      <div className="flex-shrink-0">
                        {getEventIcon(evento.tipo)}
                      </div>
                      <div className="flex-grow text-left ml-2">
                        <p className="text-slate-900 dark:text-slate-100">
                          {getEventText(evento)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {currentMatchTime}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center w-full justify-end">
                      <div className="flex-grow text-right mr-2">
                        <p className="text-slate-900 dark:text-slate-100">
                          {getEventText(evento)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {currentMatchTime}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {getEventIcon(evento.tipo)}
                      </div>
                    </div>
                  ))
                )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventosPartido;
