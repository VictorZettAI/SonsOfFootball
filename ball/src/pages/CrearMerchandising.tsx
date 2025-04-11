'use client'

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useDropzone } from 'react-dropzone';
import config from '../config';
import axiosInstance from '@/contexts/axiosConfig';

export default function CrearMerchandising() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [notification, setNotification] = useState<{ message: string, type: 'error' | 'success' } | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [price, setPrice] = useState('0 €');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] } 
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('titulo', nombre);
      formData.append('descripcion', descripcion);
      formData.append('precio', price.replace(' €', ''));
      if (file) {
        formData.append('imagen', file);
      }
      formData.append('url', url);
      formData.append('region', 'pagina_principal');
      console.log(formData)
      
      const response = await axiosInstance.post(`/publicidad/nuevo/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setNotification({
        message: "Producto guardado correctamente",
        type: 'success'
      });

      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error("Error al guardar los datos:", error);
      setNotification({
        message: "Error al guardar el producto",
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
          Crear Nuevo Merchandising
        </h1>

        {notification && (
          <div className={`mb-4 p-4 rounded-md ${
            notification.type === 'error' 
              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100' 
              : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'
          }`}>
            {notification.message}
          </div>
        )}

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="mt-1 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="mt-1 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>

              <div>
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  value={price}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setPrice(`${value} €`);
                  }}
                  className="mt-1 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>

              <div>
                <Label htmlFor="image">Imagen del producto</Label>
                <div {...getRootProps()} className="mt-1 border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer">
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p>Suelta la imagen aquí ...</p>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
                {file && (
                  <p className="mt-2 text-sm text-gray-500">Archivo seleccionado: {file.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="websiteUrl">URL del sitio web</Label>
                <Input
                  id="websiteUrl"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-1 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="bg-white dark:bg-slate-700"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Guardar Producto
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
