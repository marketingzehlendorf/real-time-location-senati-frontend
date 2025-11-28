import { useState, useEffect } from 'react';
import { MapPin, Navigation, X, Volume2, VolumeX } from 'lucide-react';

export default function NavigationPanel({ salon, ubicacionUsuario, onClose, onNavigationStart }) {
  const [navegando, setNavegando] = useState(false);
  const [distancia, setDistancia] = useState(null);
  const [tiempo, setTiempo] = useState(null);
  const [instrucciones, setInstrucciones] = useState([]);
  const [pasoActual, setPasoActual] = useState(0);
  const [sonidoActivo, setSonidoActivo] = useState(true);

  // Calcular distancia usando Haversine formula
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calcular rumbo (bearing) entre dos puntos
  const calcularRumbo = (lat1, lon1, lat2, lon2) => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    const rumbo = Math.atan2(y, x) * 180 / Math.PI;
    return (rumbo + 360) % 360;
  };

  // Obtener dirección cardinal
  const obtenerDireccion = (rumbo) => {
    const direcciones = ['Norte ⬆️', 'Noreste ↗️', 'Este ➡️', 'Sureste ↘️', 'Sur ⬇️', 'Suroeste ↙️', 'Oeste ⬅️', 'Noroeste ↖️'];
    const index = Math.round(rumbo / 45) % 8;
    return direcciones[index];
  };

  // Generar instrucciones
  const generarInstrucciones = () => {
    if (!salon || !ubicacionUsuario) return;

    const distKm = calcularDistancia(
      ubicacionUsuario.lat,
      ubicacionUsuario.lng,
      salon.ubicacion.coordinates[1],
      salon.ubicacion.coordinates[0]
    );

    const rumbo = calcularRumbo(
      ubicacionUsuario.lat,
      ubicacionUsuario.lng,
      salon.ubicacion.coordinates[1],
      salon.ubicacion.coordinates[0]
    );

    const tiempoMinutos = Math.ceil((distKm / 1.4) * 60); // Asumir 1.4 km/h de velocidad de caminata

    setDistancia(distKm);
    setTiempo(tiempoMinutos);

    const pasos = [
      {
        paso: 1,
        titulo: 'Inicio',
        descripcion: `Dirígete hacia ${obtenerDireccion(rumbo)}`,
        distancia: (distKm * 0.3).toFixed(2),
        icono: '📍'
      },
      {
        paso: 2,
        titulo: 'En camino',
        descripcion: `Continúa ${obtenerDireccion(rumbo)} por aproximadamente ${(distKm * 0.4).toFixed(2)} km`,
        distancia: (distKm * 0.4).toFixed(2),
        icono: '🚶'
      },
      {
        paso: 3,
        titulo: 'Casi llegas',
        descripcion: `Ya estás cerca, sigue ${obtenerDireccion(rumbo)} hacia tu destino`,
        distancia: (distKm * 0.3).toFixed(2),
        icono: '👀'
      },
      {
        paso: 4,
        titulo: '¡Llegaste!',
        descripcion: `Haz llegado a ${salon.nombre}. ${salon.tipo === 'baño' ? 'Puerta a tu derecha' : salon.tipo === 'comedor' ? 'Bienvenido al comedor' : 'Bienvenido al ' + salon.tipo}`,
        distancia: '0.00',
        icono: '🎉'
      }
    ];

    setInstrucciones(pasos);
  };

  // Reproducir audio
  const reproducirAudio = (texto) => {
    if (!sonidoActivo) return;
    
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    utterance.rate = 1.2;
    window.speechSynthesis.speak(utterance);
  };

  // Iniciar navegación
  const iniciarNavegacion = () => {
    setNavegando(true);
    setPasoActual(0);
    generarInstrucciones();
    onNavigationStart && onNavigationStart(true);
    reproducirAudio(`Iniciando navegación hacia ${salon.nombre}`);
  };

  // Detener navegación
  const detenerNavegacion = () => {
    setNavegando(false);
    setPasoActual(0);
    window.speechSynthesis.cancel();
    onNavigationStart && onNavigationStart(false);
  };

  // Avanzar al siguiente paso
  const siguientePaso = () => {
    if (pasoActual < instrucciones.length - 1) {
      const siguiente = pasoActual + 1;
      setPasoActual(siguiente);
      reproducirAudio(instrucciones[siguiente].descripcion);
    }
  };

  // Volver al paso anterior
  const pasoPrevio = () => {
    if (pasoActual > 0) {
      const anterior = pasoActual - 1;
      setPasoActual(anterior);
      reproducirAudio(instrucciones[anterior].descripcion);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-2xl overflow-hidden border-2 border-blue-500 z-50">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-start">
        <div className="flex-1">
          <h2 className="text-xl font-bold">{salon?.nombre}</h2>
          <p className="text-blue-100 text-sm mt-1">
            {salon?.tipo.toUpperCase()} • {salon?.edificio} • Piso {salon?.piso}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-blue-800 p-2 rounded transition"
        >
          <X size={24} />
        </button>
      </div>

      {/* Contenido */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {!navegando ? (
          // Vista previa
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">{salon?.descripcion}</p>
              {salon?.capacidad && (
                <p className="text-sm text-gray-600">👥 Capacidad: {salon.capacidad} personas</p>
              )}
              {salon?.contacto && (
                <p className="text-sm text-gray-600">📞 {salon.contacto}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-100 p-3 rounded text-center">
                <p className="text-2xl font-bold text-blue-600">{distancia?.toFixed(2)}</p>
                <p className="text-xs text-gray-600">km de distancia</p>
              </div>
              <div className="bg-gray-100 p-3 rounded text-center">
                <p className="text-2xl font-bold text-blue-600">{tiempo}</p>
                <p className="text-xs text-gray-600">minutos aprox.</p>
              </div>
            </div>

            <button
              onClick={iniciarNavegacion}
              className="w-full bg-linear-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:shadow-lg transition"
            >
              <Navigation size={20} />
              Iniciar Navegación
            </button>
          </div>
        ) : (
          // Vista de navegación
          <div className="space-y-4">
            {instrucciones.length > 0 && (
              <>
                {/* Progreso */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Paso {pasoActual + 1} de {instrucciones.length}
                    </span>
                    <span className="text-sm text-gray-600">
                      {Math.round(((pasoActual + 1) / instrucciones.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-linear-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((pasoActual + 1) / instrucciones.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Instrucción actual */}
                <div className="bg-linear-to-br from-blue-50 to-green-50 p-4 rounded-lg border-2 border-green-400">
                  <p className="text-3xl mb-2">{instrucciones[pasoActual].icono}</p>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {instrucciones[pasoActual].titulo}
                  </h3>
                  <p className="text-gray-700 mb-2">{instrucciones[pasoActual].descripcion}</p>
                  <p className="text-sm text-gray-600">
                    📏 Distancia: {instrucciones[pasoActual].distancia} km
                  </p>
                </div>

                {/* Botones de navegación */}
                <div className="flex gap-2">
                  <button
                    onClick={pasoPrevio}
                    disabled={pasoActual === 0}
                    className="flex-1 bg-gray-400 text-white py-2 rounded font-semibold disabled:opacity-50 hover:bg-gray-500 transition"
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={siguientePaso}
                    disabled={pasoActual === instrucciones.length - 1}
                    className="flex-1 bg-blue-500 text-white py-2 rounded font-semibold disabled:opacity-50 hover:bg-blue-600 transition"
                  >
                    Siguiente →
                  </button>
                </div>

                {/* Control de audio */}
                <button
                  onClick={() => setSonidoActivo(!sonidoActivo)}
                  className={`w-full py-2 rounded font-semibold flex items-center justify-center gap-2 transition ${
                    sonidoActivo
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  {sonidoActivo ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  {sonidoActivo ? 'Sonido Activado' : 'Sonido Desactivado'}
                </button>
              </>
            )}

            {/* Botón detener */}
            <button
              onClick={detenerNavegacion}
              className="w-full bg-red-500 text-white py-2 rounded font-bold hover:bg-red-600 transition"
            >
              ✕ Detener Navegación
            </button>
          </div>
        )}
      </div>
    </div>
  );
}