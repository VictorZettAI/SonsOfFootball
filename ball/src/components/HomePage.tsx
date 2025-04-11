'use client'
// Arreglar todo el tema de crear publicidad, dado que no es optimo ni tiene en cuenta si ha ocurrido un error al subirlo.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Menu, X, ChevronRight, Star, ShoppingCart, Volume2, VolumeX, ArrowRight, Trophy, Calendar, Users, Sun, Moon, Heart, Share2, MessageCircle, MapPin, Plus, Edit, Trash2, Globe, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useDropzone } from 'react-dropzone';
import config from '../config';
import axiosInstance from '@/contexts/axiosConfig';
import { Check_Validation } from "@/contexts/cheking"

// Interfaces para la API
interface EquipoData {
  id: number;
  nombre: string;
  escudo: string | null;
  marcador: number | null;
}

interface ProductItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  websiteUrl: string;
}

interface PartidoData {
  id: number;
  fecha_inicio: string;
  fecha_final: string;
  equipo_1: EquipoData;
  equipo_2: EquipoData;
  localizacion: string;
  competicion: string;
  empezado: boolean;
  finalizado: boolean;
  minutos_jugados: number;
}

interface EventoData {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_final: string;
  empezado: boolean;
  finalizado: boolean;
  imagen: string | null;
  equipos: number;
  ganador: EquipoData | null;
  partidos: PartidoData | null;
  tipo?: string;
}

interface PatrocinadorData {
  id: number;
  nombre: string;
  imagen: string;
}

interface PaginaPrincipalData {
  banner: PartidoData[];
  presente: {
    evento: EventoData[];
    partido: PartidoData[];
  };
  futuro: {
    evento: EventoData[];
    partido: PartidoData[];
  };
  pasado: {
    evento: EventoData[];
    partido: PartidoData[];
  };
  patrocinador: PatrocinadorData[];
  publicidad: any;
}

interface HomePageProps {
  width?: string;
}

// Hook personalizado para obtener los datos
const usePaginaPrincipalData = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaultz, setDefaultz] = useState()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log(`${config.API_URL}/pagina_principal/`)
        const response = await fetch(`${config.API_URL}/pagina_principal/`);
        if (!response.ok) {
          throw new Error('Error al cargar los datos');
        }
        const jsonData = await response.json();
        setData(jsonData);
        console.log("Datos recibidos:", jsonData);
        const response_2 = await fetch(`${config.API_URL}/jugador/default/`);
        if (!response_2.ok) {
          throw new Error('Error al cargar los datos');
        }
        const jsonData_2 = await response_2.json();
        setDefaultz(jsonData_2.id);
        console.log("Datos recibidos del default:", jsonData_2.id);

      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error desconocido');
        console.error("Error al fetch los datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error, defaultz };
};

export default function HomePage({ width = '100vw' }: HomePageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [patrocinadores, setPatrocinadores] = useState<PatrocinadorData[]>([]);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'error' | 'success' } | null>(null);

  const [nombre, setNombre] = useState()
  const [descripcion, setDescripcion] = useState()
  const [price, setPrice] = useState()
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState()
  const [validado, setValidado] = useState(false)

  useEffect(() => {
    Check_Validation().then((variable) => {
      console.log(variable)
      setValidado(variable)
    })
  }, [])

  const handleAddProduct = () => {
    if (products.length >= 4) {
      setNotification({
        message: "No se pueden agregar más de 4 productos.",
        type: 'error'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    const newProduct = {
      id: null,
      name: '',
      description: '',
      price: '0 €',
      image: null,
      websiteUrl: '',
    };
    setEditingProduct(newProduct);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };
  const fetch_Patrocinadoreliminar = async (idx) => {
    try {
      const response = await axiosInstance.delete(`/publicidad/mod/${idx}/`)
    }
    catch (error) {
      console.error('Error completo:', error)
    }
  }
  const handleDeleteProduct = (productId: string) => {
    fetch_Patrocinadoreliminar(productId)
    setProducts(products.filter(p => p.id !== productId));
    setNotification({
      message: "Producto eliminado correctamente",
      type: 'success'
    });
    setTimeout(() => setNotification(null), 3000);
  };
  const fetchPatrocinadores_Nuevo = async (datosy: React.FormEvent) => {
    try {
      const formData = new FormData()
      formData.append('titulo', nombre)
      formData.append('descripcion', descripcion)
      formData.append('precio', price)
      if (file) {
        formData.append('imagen', file)
      }
      formData.append('url', url)
      formData.append('region', 'pagina_principal')
      console.log(formData)
      const response = await axiosInstance.post(`/publicidad/nuevo/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const data = await response.data
      return data
    }
    catch (error) {
      console.error("Error al fetch los datos:", error);
      setNotification({
        message: "Error al cargar los patrocinadores",
        type: 'error'
      });
    }
  };
  const fetchPatrocinadores_Mod = async (datosy) => {
    console.log(datosy)
    try {
      const formData = new FormData()
      if (nombre) {
        formData.append('titulo', nombre)
      }
      if (descripcion) {
        formData.append('descripcion', descripcion)
      }
      if (price) {
        formData.append('precio', price)
      }
      if (file) {
        formData.append('imagen', file)
      }
      if (url) {
        formData.append('url', url)
      }
      const response = await axiosInstance.patch(`/publicidad/mod/${datosy.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const data = await response.data
      return data
    }
    catch (error) {
      console.error("Error al fetch los datos:", error);
      setNotification({
        message: "Error al cargar los patrocinadores",
        type: 'error'
      });
    }
  };

  const handleSaveProduct = async (updatedProduct) => {
    if (products.find(p => p.id === updatedProduct.id)) {
      const respuesta = await fetchPatrocinadores_Mod(updatedProduct)
      updatedProduct.image = respuesta.imagen
      setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    } else {
      const respuesta = await fetchPatrocinadores_Nuevo(updatedProduct)
      console.log(respuesta)
      updatedProduct.id = respuesta.id
      updatedProduct.image = respuesta.imagen
      console.log(updatedProduct)
      setProducts([...products, updatedProduct]);
    }
    setEditingProduct(null);
    setIsDialogOpen(false);
    setNotification({
      message: "Producto guardado correctamente",
      type: 'success'
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, image: acceptedFiles[0] });
      setFile(acceptedFiles[0])
    }
  }, [editingProduct]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });


  useEffect(() => {
    const fetchPatrocinadores = async () => {
      try {
        const response = await fetch(`${config.API_URL}/pagina_principal/`);
        if (!response.ok) {
          throw new Error('Error al cargar los datos');
        }
        const data = await response.json();
        setPatrocinadores(data.patrocinador);
      } catch (error) {
        console.error("Error al fetch los datos:", error);
        setNotification({
          message: "Error al cargar los patrocinadores",
          type: 'error'
        });
      }
    };

    fetchPatrocinadores();
  }, []);

  const handleDeletePatrocinador = (id: number) => {
    try {
      const response = axiosInstance.delete(`/patrocinador/mod/${id}/`)
      setPatrocinadores(patrocinadores.filter(p => p.id !== id));
      setNotification({
        message: "Patrocinador eliminado correctamente",
        type: 'success'
      });
      setTimeout(() => setNotification(null), 3000);
    }
    catch (error) {
      console.error('Error completo:', error);
    }
  };

  // Hook para obtener los datos
  const { data, isLoading, error, defaultz } = usePaginaPrincipalData();

  useEffect(() => {
    console.log("Datos completos:", data);
    console.log("Eventos presentes:", data?.presente?.evento);
    console.log("Publicidad:", data?.publicidad);

    const SelectedProduct = data?.publicidad?.map(vary => {
      return {
        id: vary.id,
        name: vary.titulo,
        description: vary.descripcion,
        price: vary.precio,
        image: vary.imagen,
        websiteUrl: vary.url,
      }
    });
    setProducts(SelectedProduct)
  }, [data?.publicidad]);

  useEffect(() => {
    if (data?.banner && data.banner.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % data.banner.length);
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [data?.banner]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="w-full min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-xl text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  // Verificación de datos
  if (!data) {
    return (
      <div className="w-full min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">No hay datos para mostrar.</div>
      </div>
    );
  }

  // Array of background images for banners
  const bannerBackgrounds = [
    'url("/banner1.jpg")',
    'url("/banner2.jpg")',
    'url("/banner3.jpg")',
    'url("/banner4.jpg")',
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-300" style={{ maxWidth: width, margin: '0 auto' }}>
      <main>
        {/* Banner Section */}
        <section className="relative h-[80vh] overflow-hidden">
          {data.banner.map((partido, index) => (
            <motion.div
              key={partido.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentSlide ? 1 : 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
              style={{
                pointerEvents: index === currentSlide ? 'auto' : 'none',
              }}
            >
              {/* Fondo */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: bannerBackgrounds[index % bannerBackgrounds.length],
                }}
              />

              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
                <div className="text-center max-w-4xl px-4">
                  <motion.h2
                    className="text-4xl lg:text-6xl font-bold mb-2 text-white shadow-text"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  >
                    {partido.competicion ?? 'Competición'}
                  </motion.h2>
                  <motion.div
                    className="text-xl lg:text-2xl mb-4 text-gray-200 shadow-text"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  >
                    <div className="flex items-center justify-center space-x-4">
                      {partido.equipo_1?.id && partido.equipo_1.id != defaultz ? (
                        <Link to={`Equipo/${partido.equipo_1.id}`}>
                          <div className="flex items-center">
                            <img
                              src={partido.equipo_1.escudo || "/placeholder.svg?height=48&width=48"}
                              alt={partido.equipo_1?.nombre ?? 'Equipo 1'}
                              className="w-12 h-12 object-contain"
                            />
                            <span className="ml-2">{partido.equipo_1?.nombre}</span>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-center">
                          <span className="ml-2">Equipo 1</span>
                        </div>
                      )}

                      <div className="text-2xl font-bold">
                        {`${partido.equipo_1.marcador !== null ? partido.equipo_1.marcador : '0'} - ${partido.equipo_2.marcador !== null ? partido.equipo_2.marcador : '0'}`}
                      </div>
                      {partido.equipo_2?.id && partido.equipo_2.id != defaultz ? (
                        <Link to={`Equipo/${partido.equipo_2.id}`}>
                          <div className="flex items-center">
                            <img
                              src={partido.equipo_2.escudo || "/placeholder.svg?height=48&width=48"}
                              alt={partido.equipo_2?.nombre ?? 'Equipo 1'}
                              className="w-12 h-12 object-contain"
                            />
                            <span className="ml-2">{partido.equipo_2?.nombre}</span>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-center">
                          <span className="ml-2">Equipo 2</span>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    className="text-xl mb-6 text-gray-200 shadow-text"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                  >
                    {partido.empezado && !partido.finalizado ? (
                      <span>{partido.minutos_jugados}'</span>
                    ) : !partido.empezado ? (
                      <span>
                        {new Date(partido.fecha_inicio).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    ) : (
                      <span>Finalizado</span>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                  >
                    <Link to={`/partido/${partido.id}/`}>
                      <Button
                        size="lg"
                        className="bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700 shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        Ver Transmisión<ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Torneos y Ligas Section */}
        <section className="py-16 bg-white dark:bg-slate-800 transition-colors duration-300">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              Torneos y Ligas
            </motion.h2>
            <Tabs defaultValue="presente" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-200 dark:bg-slate-700">
                <TabsTrigger value="presente" className="data-[state=active]:bg-red-500 data-[state=active]:text-white dark:data-[state=active]:bg-red-600">
                  En Curso
                </TabsTrigger>
                <TabsTrigger value="futuro" className="data-[state=active]:bg-red-500 data-[state=active]:text-white dark:data-[state=active]:bg-red-600">
                  Próximos
                </TabsTrigger>
                <TabsTrigger value="pasado" className="data-[state=active]:bg-red-500 data-[state=active]:text-white dark:data-[state=active]:bg-red-600">
                  Finalizados
                </TabsTrigger>
              </TabsList>

              {['presente', 'futuro', 'pasado'].map((tiempo) => (
                <TabsContent key={tiempo} value={tiempo}>
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {data[tiempo as keyof typeof data]?.evento.map((evento) => (
                      <motion.div key={evento.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Card className="overflow-hidden text-left bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 shadow-lg hover:shadow-xl transition-all duration-300">
                          <img
                            src={evento.imagen ? `${config.API_URL}${evento.imagen}` : "/placeholder.svg?height=200&width=400"}
                            alt={evento.nombre || 'Evento'}
                            className="w-full h-48 object-cover"
                          />
                          <CardHeader className="text-left">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-gray-900 dark:text-gray-100 text-2xl">
                                {evento.nombre || 'Evento'}
                              </CardTitle>
                              {evento.tipo && (
                                <Badge variant="secondary" className="bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-gray-100">
                                  {evento.tipo}
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="text-left">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {evento.equipos} Equipos | {new Date(evento.fecha_inicio).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>

                            {evento.partidos && (
                              <p className="font-bold mt-2 text-gray-900 dark:text-gray-100">
                                {evento.partidos.equipo_1?.id && evento.partidos.equipo_1.id != defaultz ? (
                                  <Link to={`Equipo/${evento.partidos.equipo_1.id}/`}>
                                    {evento.partidos.equipo_1.nombre}<> </>
                                  </Link>
                                ) : (
                                  <>Equipo 1 </>
                                )}

                                {evento.partidos.equipo_1?.marcador ?? '-'} - {evento.partidos.equipo_2?.marcador ?? '-'}


                                {evento.partidos.equipo_2?.id && evento.partidos.equipo_2.id != defaultz ? (
                                  <Link to={`Equipo/${evento.partidos.equipo_2.id}/`}>
                                    <> </>{evento.partidos.equipo_2.nombre}
                                  </Link>
                                ) : (
                                  <> Equipo 2</>
                                )}
                              </p>
                            )}

                            <div className="flex justify-between items-center mt-4">
                              <Link to={`/${evento.tipo_event}/${evento.id}/`}>
                                <Button variant="link" className="p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                                  Ver Detalles <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </Link>
                              {evento.ganador && (
                                <div className="flex items-center">
                                  <Trophy className="h-4 w-4 text-red-500 mr-1" />
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {evento.ganador?.nombre?.includes('?') ? 'Sin definir' : evento.ganador?.nombre || 'Sin definir'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* Partidos Section */}
        <section className="py-16 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              Partidos
            </motion.h2>
            <Tabs defaultValue="presente" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-200 dark:bg-slate-700">
                <TabsTrigger value="presente" className="data-[state=active]:bg-red-500 data-[state=active]:text-white dark:data-[state=active]:bg-red-600">
                  En Vivo
                </TabsTrigger>
                <TabsTrigger value="futuro" className="data-[state=active]:bg-red-500 data-[state=active]:text-white dark:data-[state=active]:bg-red-600">
                  Próximos
                </TabsTrigger>
                <TabsTrigger value="pasado" className="data-[state=active]:bg-red-500 data-[state=active]:text-white dark:data-[state=active]:bg-red-600">
                  Finalizados
                </TabsTrigger>
              </TabsList>

              {['presente', 'futuro', 'pasado'].map((tiempo) => (
                <TabsContent key={tiempo} value={tiempo}>
                  <motion.div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {data[tiempo as keyof typeof data]?.partido.map((partido) => (
                      <motion.div
                        key={partido.id}
                        className="relative group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card className="bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 shadow-lg hover:shadow-xl transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                              <div className="flex items-center space-x-8">
                                <div className="flex items-center space-x-4">
                                  {partido.equipo_1?.id && partido.equipo_1.id != defaultz ? (
                                    <Link to={`Equipo/${partido.equipo_1.id}`}>
                                      <div className="text-center">
                                        <div className="relative w-12 h-12 transition-transform duration-300 hover:scale-110">
                                          <img
                                            src={partido.equipo_1.escudo || "/placeholder.svg?height=48&width=48"}
                                            alt={partido.equipo_1?.nombre}
                                            className="rounded-full"
                                          />
                                        </div>
                                        <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                          {partido.equipo_1?.nombre}
                                        </p>
                                      </div>
                                    </Link>
                                  ) : (
                                    <div className="text-center">
                                      <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Equipo 1'
                                      </p>
                                    </div>
                                  )}

                                  <div className={`px-4 py-2 rounded-lg text-lg font-semibold ${partido.finalizado
                                    ? 'bg-gray-100 text-gray-800 dark:bg-slate-600 dark:text-gray-100'
                                    : partido.empezado
                                      ? 'bg-red-600 text-white'
                                      : 'bg-gray-100 text-gray-800 dark:bg-slate-600 dark:text-gray-100'
                                    }`}>
                                    {partido.empezado ? (
                                      `${partido.equipo_1.marcador ?? 0} - ${partido.equipo_2.marcador ?? 0}`
                                    ) : (
                                      'vs'
                                    )}
                                  </div>

                                  {partido.equipo_2?.id && partido.equipo_2.id != defaultz ? (
                                    <Link to={`Equipo/${partido.equipo_2.id}`}>
                                      <div className="text-center">
                                        <div className="relative w-12 h-12 transition-transform duration-300 hover:scale-110">
                                          <img
                                            src={partido.equipo_2.escudo || "/placeholder.svg?height=48&width=48"}
                                            alt={partido.equipo_2?.nombre}
                                            className="rounded-full"
                                          />
                                        </div>
                                        <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                          {partido.equipo_2?.nombre}
                                        </p>
                                      </div>
                                    </Link>
                                  ) : (
                                    <div className="text-center">
                                      <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Equipo 2'
                                      </p>
                                    </div>
                                  )}

                                </div>
                              </div>

                              <div className="flex flex-col items-end space-y-2">
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                  <div className="flex items-center justify-end space-x-2">
                                    <Trophy className="w-4 h-4 text-red-500" />
                                    <span>{partido.competicion ?? 'Competición'}</span>
                                  </div>
                                  <div className="flex items-center justify-end space-x-2 mt-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      {new Date(partido.fecha_inicio).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  {partido.localizacion && (
                                    <div className="flex items-center justify-end space-x-2 mt-1">
                                      <MapPin className="w-4 h-4" />
                                      <span>{partido.localizacion}</span>
                                    </div>
                                  )}
                                </div>
                                <Link to={`partido/${partido.id}/`}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-gray-100 text-gray-800 hover:bg-red-500 hover:text-white dark:bg-slate-600 dark:text-gray-100 dark:hover:bg-red-600"
                                  >
                                    {partido.finalizado ? 'Ver detalles' : partido.empezado ? 'Ver en vivo' : 'Ver detalles'}
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* Mercancía Oficial Section */}
        <section className="py-16 bg-white dark:bg-slate-800 transition-colors duration-300">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-gray-100"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              Mercancía Oficial
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products?.map((product) => (
                <Card key={product.id} className="overflow-hidden bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 shadow-lg hover:shadow-xl transition-all duration-300 relative">
                  {validado && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar producto</span>
                    </Button>
                  )}
                  {console.log(product)}
                  {product.image && (
                    <img
                      src={`${product.image}`}
                      alt={product.name}
                      className="w-full h-48 object-contain bg-white"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg?height=200&width=400";
                      }}
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{product.description}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{product.price} €</p>
                    <div className="flex flex-col space-y-2">
                      <Link to="/carrito">
                        <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                          <ShoppingCart className="mr-2 h-4 w-4" /> Añadir al carrito
                        </Button>
                      </Link>
                      {product.websiteUrl && (
                        <a href={product.websiteUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="w-full">
                            <Globe className="mr-2 h-4 w-4" /> Visitar sitio web
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Patrocinadores Section */}
        <section className="py-16 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-gray-100"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              Nuestros Patrocinadores
            </motion.h2>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {patrocinadores.map((patrocinador) => (
                <motion.div
                  key={patrocinador.id}
                  className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={patrocinador.logo || "/placeholder.svg?height=100&width=200"}
                    alt={patrocinador.nombre || 'Patrocinador'}
                    className="w-full h-auto object-contain mb-2"
                  />
                  <p className="text-center text-gray-700 dark:text-gray-300 text-sm">
                    {patrocinador.nombre}
                  </p>
                  {validado && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => handleDeletePatrocinador(patrocinador.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar patrocinador</span>
                    </Button>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      {/* Dialog for adding/editing products */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle>{editingProduct?.id ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
            <DialogDescription>
              {editingProduct?.id ? 'Modifica los detalles del producto.' : 'Ingresa los detalles del nuevo producto.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingProduct) {
              handleSaveProduct(editingProduct);
            }
          }}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={editingProduct?.name ?? ''}
                  onChange={(e) => {
                    setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null);
                    setNombre(e.target.value);
                  }}
                  className="mt-1 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={editingProduct?.description ?? ''}
                  onChange={(e) => {
                    setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)
                    setDescripcion(e.target.value)
                  }}
                  className="mt-1 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="price">Precio (€)</Label>
                <Input
                  id="price"
                  value={editingProduct?.price ?? '0'}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9,]/g, '');
                    setEditingProduct(prev => prev ? { ...prev, price: value } : null);
                    setPrice(e.target.value)
                  }}
                  className="mt-1 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="image">Imagen del producto</Label>
                <div {...getRootProps()} className="mt-1 border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer">
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p>Suelta la imagen aquí ...</p>
                  ) : (<>
                    <div>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p>Arrastra y suelta una imagen aquí, o haz clic para seleccionar una</p>
                    </div>
                    <Input
                      id="image"
                      type="file"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                      accept="image/*"
                    />
                  </>)}
                </div>
                {editingProduct?.image && (
                  <p className="mt-2 text-sm text-gray-500">Archivo seleccionado: {editingProduct.image.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="websiteUrl">URL del sitio web</Label>
                <Input
                  id="websiteUrl"
                  value={editingProduct?.websiteUrl ?? ''}
                  onChange={(e) => {
                    setEditingProduct(prev => prev ? { ...prev, websiteUrl: e.target.value } : null)
                    setUrl(e.target.value)
                  }}
                  className="mt-1 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Guardar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${notification.type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-green-500 text-white'
            }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}
