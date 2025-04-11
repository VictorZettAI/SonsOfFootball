import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Layout from './components/Layout';
import HomePage from "./components/HomePage"
import EnhancedLeagueStandings from "./components/liga"
import InfoPartido from "./components/InfoPartido"
import InfoEquipo from "./components/InfoEquipo"
import Torneo from "./components/Torneo"
import Consola from "./components/Consola"
import Login from "./components/Login"
import CrearTorneo from "./components/CrearTorneo"
import CrearLiga from "./components/CrearLiga"
import CrearChampions from "./components/CrearChampions"
import CrearEquipo from "./components/CrearEquipo"
import CrearJugador from "./components/CrearJugador"
import CrearPatrocinador from "./components/CrearPatrocinador"
import CrearPartido from "./components/CrearPartido"
import CrearMerchandising from "./pages/CrearMerchandising"
import Champions from "./components/Champions"
import ProtectedRoute from "./contexts/ProtectedRoute"
import './App.css'
// import { MatchProvider } from './contexts/MatchContext'


function App() {
  return (
    <Router>
      {/* <MatchProvider> */}
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />
          <Route
            path="/Champions/:id/"
            element={
              <Layout>
                <Champions />
              </Layout>
            }
          />
          <Route
            path="/Torneo/:id/"
            element={
              <Layout>
                <Torneo />
              </Layout>
            }
          />
          <Route
            path="/Partido/:id/"
            element={
              <Layout>
                <InfoPartido />
              </Layout>
            }
          />
          <Route
            path="/Equipo/:id/"
            element={
              <Layout>
                <InfoEquipo />
              </Layout>
            }
          />
          <Route
            path="/Login/"
            element={
              <Login />
            }
          />
          <Route
            path="/Crear/Champions/"
            element={
              <ProtectedRoute>
                <Layout>
                  <CrearChampions />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/Crear/Equipo/"
            element={
              <ProtectedRoute>
                <Layout>
                  <CrearEquipo />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/Crear/Jugador/"
            element={
              <ProtectedRoute>
                <Layout>
                  <CrearJugador />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/Crear/Patrocinador/"
            element={
              <ProtectedRoute>
                <Layout>
                  <CrearPatrocinador />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/Crear/Liga/"
            element={
              <ProtectedRoute>
                <Layout>
                  <CrearLiga />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/Liga/:id/"
            element={
              <Layout>
                <EnhancedLeagueStandings />
              </Layout>
            }
          />
          <Route
            path="/Crear/Torneo/"
            element={
              <ProtectedRoute>
                <Layout>
                  <CrearTorneo />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/Crear/Partido/"
            element={
              <ProtectedRoute>
                <Layout>
                  <CrearPartido />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/Crear/Merchandising/"
            element={
              <ProtectedRoute>
                <Layout>
                  <CrearMerchandising />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/Consola/:id/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Consola />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      {/* </MatchProvider> */}
    </Router>
  );
}

export default App;