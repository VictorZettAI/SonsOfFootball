// import React, { createContext, useContext, useEffect, useState } from 'react';

// interface MatchContextType {
//   partidoData: any;
//   eventos: any[];
//   isLoading: boolean;
//   error: string | null;
// }

// const MatchContext = createContext<MatchContextType | null>(null);

// export function MatchProvider({ children }: { children: React.ReactNode }) {
//   const [partidoData, setPartidoData] = useState(null);
//   const [eventos, setEventos] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchData = async () => {
//     try {
//       const response = await fetch('http://localhost:8000/partido/1/');
//       const data = await response.json();
      
//       // Solo actualizar si hay cambios
//       if (JSON.stringify(data) !== JSON.stringify(partidoData)) {
//         setPartidoData(data);
//         setEventos(data.eventos || []);
//       }
      
//       setIsLoading(false);
//     } catch (err) {
//       console.error('Error:', err);
//       setError(err instanceof Error ? err.message : 'Error desconocido');
//     }
//   };

//   useEffect(() => {
//     fetchData();
    
//     // Solo hacer polling si el partido está en vivo
//     const interval = setInterval(() => {
//       if (partidoData?.estado === 'En Vivo') {
//         fetchData();
//       }
//     }, 1000); // Actualizar cada segundo

//     return () => clearInterval(interval);
//   }, [partidoData?.estado]);

//   return (
//     <MatchContext.Provider value={{ partidoData, eventos, isLoading, error }}>
//       {children}
//     </MatchContext.Provider>
//   );
// }

// export function useMatch() {
//   const context = useContext(MatchContext);
//   if (!context) {
//     throw new Error('useMatch debe usarse dentro de un MatchProvider');
//   }
//   return context;
// }