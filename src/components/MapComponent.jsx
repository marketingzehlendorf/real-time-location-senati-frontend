import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

// Iconos personalizados
const iconoAula = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconoLaboratorio = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconoAuditorio = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconoUsuario = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Función para seleccionar icono según tipo
const obtenerIcono = (tipo) => {
  switch (tipo) {
    case 'laboratorio':
      return iconoLaboratorio;
    case 'auditorio':
      return iconoAuditorio;
    default:
      return iconoAula;
  }
};

// Componente para centrar el mapa en un salón seleccionado
const CentroMapa = ({ lat, lng, zoom = 18 }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, zoom, map]);
  return null;
};

export default function MapComponent({ 
  salones = [], 
  salonSeleccionado = null, 
  mostrarUbicacionUsuario = true,
  onSalonClick = null 
}) {
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Obtener ubicación del usuario
  useEffect(() => {
    if (mostrarUbicacionUsuario) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUbicacionUsuario({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setCargando(false);
        },
        (error) => {
          console.warn('No se pudo obtener la ubicación:', error);
          // Centro por defecto (SENATI Lima - CAMBIA ESTO A TU UBICACIÓN REAL)
          // Obtén tus coordenadas en: https://www.google.com/maps
          setUbicacionUsuario({
            lat: -12.0464,  // Cambia esto a tu latitud
            lng: -77.0428   // Cambia esto a tu longitud
          });
          setCargando(false);
        }
      );
    } else {
      setCargando(false);
    }
  }, [mostrarUbicacionUsuario]);

  if (cargando) {
    return <div className="w-full h-full flex items-center justify-center">Cargando mapa...</div>;
  }

  const centro = salonSeleccionado 
    ? [salonSeleccionado.ubicacion.coordinates[1], salonSeleccionado.ubicacion.coordinates[0]]
    : ubicacionUsuario 
    ? [ubicacionUsuario.lat, ubicacionUsuario.lng]
    : [-12.0464, -77.0428];

  return (
    <MapContainer 
      center={centro} 
      zoom={18} 
      className="w-full h-full rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Ubicación del usuario */}
      {ubicacionUsuario && (
        <>
          <Marker 
            position={[ubicacionUsuario.lat, ubicacionUsuario.lng]} 
            icon={iconoUsuario}
          >
            <Popup>
              <div className="text-center">
                <p className="font-bold">Tu ubicación</p>
                <p className="text-sm text-gray-600">
                  {ubicacionUsuario.lat.toFixed(4)}, {ubicacionUsuario.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
          <Circle 
            center={[ubicacionUsuario.lat, ubicacionUsuario.lng]} 
            radius={50}
            pathOptions={{ color: 'green', fillOpacity: 0.1 }}
          />
        </>
      )}

      {/* Marcadores de salones */}
      {salones.map((salon) => {
        const lat = salon.ubicacion.coordinates[1];
        const lng = salon.ubicacion.coordinates[0];
        return (
          <Marker 
            key={salon._id} 
            position={[lat, lng]} 
            icon={obtenerIcono(salon.tipo)}
            eventHandlers={{
              click: () => onSalonClick && onSalonClick(salon)
            }}
          >
            <Popup>
              <div className="w-48">
                <h3 className="font-bold text-lg mb-2">{salon.nombre}</h3>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Tipo:</span> {salon.tipo}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Piso:</span> {salon.piso}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Edificio:</span> {salon.edificio}
                </p>
                {salon.capacidad && (
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-semibold">Capacidad:</span> {salon.capacidad} personas
                  </p>
                )}
                {salon.descripcion && (
                  <p className="text-sm text-gray-600 mt-2">{salon.descripcion}</p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Centro el mapa si hay salón seleccionado */}
      {salonSeleccionado && (
        <CentroMapa 
          lat={salonSeleccionado.ubicacion.coordinates[1]} 
          lng={salonSeleccionado.ubicacion.coordinates[0]} 
          zoom={19}
        />
      )}
    </MapContainer>
  );
}