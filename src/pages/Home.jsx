import { useState, useEffect } from 'react';
import MapComponent from '../components/MapComponent';
import SearchBar from '../components/SearchBar';
import SalonList from '../components/SalonList';
import NavigationPanel from '../components/NavigationPanel';
import { salonService } from '../services/api';

export default function Home() {
  const [salones, setSalones] = useState([]);
  const [salonesFiltrados, setSalonesFiltrados] = useState([]);
  const [salonSeleccionado, setSalonSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null);
  const [navegando, setNavegando] = useState(false);

  // Cargar salones al montar
  useEffect(() => {
    cargarSalones();
    // Obtener ubicación del usuario
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUbicacionUsuario({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.warn('No se pudo obtener la ubicación:', error);
        // Centro por defecto
        setUbicacionUsuario({
          lat: -12.0464,
          lng: -77.0428
        });
      }
    );
  }, []);

  const cargarSalones = async () => {
    try {
      setCargando(true);
      setError(null);
      const datos = await salonService.obtenerTodos();
      setSalones(datos);
      setSalonesFiltrados(datos);
    } catch (err) {
      setError('Error al cargar los salones. Asegúrate de que el backend está corriendo.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar salones según búsqueda y tipo
  useEffect(() => {
    let resultado = salones;

    if (busqueda.trim()) {
      resultado = resultado.filter(salon =>
        salon.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        salon.edificio.toLowerCase().includes(busqueda.toLowerCase()) ||
        salon.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    if (filtroTipo) {
      resultado = resultado.filter(salon => salon.tipo === filtroTipo);
    }

    setSalonesFiltrados(resultado);
  }, [busqueda, filtroTipo, salones]);

  const handleBusqueda = (valor) => {
    setBusqueda(valor);
  };

  const handleFiltroTipo = (valor) => {
    setFiltroTipo(valor);
  };

  const handleSelectSalon = (salon) => {
    setSalonSeleccionado(salon);
  };

  const handleNavigationStart = (activo) => {
    setNavegando(activo);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-3xl font-bold">🏫 SENATI - Localizador de Salones</h1>
        <p className="text-blue-100 mt-1">Encuentra tu salón en tiempo real</p>
      </header>

      {/* Contenedor principal */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Panel izquierdo - Lista de salones */}
        <div className="w-96 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold mb-3">Salones</h2>
            <SearchBar 
              onSearch={handleBusqueda}
              onFiltroTipo={handleFiltroTipo}
            />
          </div>

          {/* Lista de salones */}
          <div className="flex-1 overflow-y-auto p-4">
            {cargando ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Cargando salones...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={cargarSalones}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <SalonList
                salones={salonesFiltrados}
                onSelectSalon={handleSelectSalon}
                onNavigate={(salon) => {
                  setSalonSeleccionado(salon);
                  setNavegando(true);
                }}
                salonSeleccionado={salonSeleccionado}
              />
            )}
          </div>

          {/* Info del salón seleccionado */}
          {salonSeleccionado && (
            <div className="border-t border-gray-200 p-4 bg-blue-50">
              <h3 className="font-bold text-lg mb-2">{salonSeleccionado.nombre}</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-semibold">Tipo:</span> {salonSeleccionado.tipo}</p>
                <p><span className="font-semibold">Edificio:</span> {salonSeleccionado.edificio}</p>
                <p><span className="font-semibold">Piso:</span> {salonSeleccionado.piso}</p>
                {salonSeleccionado.capacidad && (
                  <p><span className="font-semibold">Capacidad:</span> {salonSeleccionado.capacidad} personas</p>
                )}
                {salonSeleccionado.contacto && (
                  <p><span className="font-semibold">Contacto:</span> {salonSeleccionado.contacto}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Panel derecho - Mapa */}
        <div className="flex-1 rounded-lg shadow-md overflow-hidden">
          {cargando ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <p className="text-gray-600">Cargando mapa...</p>
            </div>
          ) : (
            <MapComponent
              salones={salonesFiltrados}
              salonSeleccionado={salonSeleccionado}
              mostrarUbicacionUsuario={true}
              onSalonClick={handleSelectSalon}
              ubicacionUsuarioProps={ubicacionUsuario}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 text-center py-3 text-sm">
        <p>Total de salones: <span className="font-bold">{salonesFiltrados.length}</span> de {salones.length}</p>
      </footer>

      {/* Panel de Navegación */}
      {salonSeleccionado && navegando && (
        <NavigationPanel
          salon={salonSeleccionado}
          ubicacionUsuario={ubicacionUsuario}
          onClose={() => {
            setNavegando(false);
            setSalonSeleccionado(null);
          }}
          onNavigationStart={handleNavigationStart}
        />
      )}
    </div>
  );
}