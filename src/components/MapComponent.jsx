import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Configura tu token de Mapbox
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

export default function MapComponent({
  salones = [],
  salonSeleccionado = null,
  mostrarUbicacionUsuario = true,
  onSalonClick = null,
  ubicacionUsuarioProps = null
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [ubicacionUsuario, setUbicacionUsuario] = useState(ubicacionUsuarioProps);
  const [cargando, setCargando] = useState(true);
  const markersRef = useRef({});
  const routeSourceRef = useRef(null);

  // Actualizar ubicación cuando venga desde props
  useEffect(() => {
    if (ubicacionUsuarioProps) {
      setUbicacionUsuario(ubicacionUsuarioProps);
      setCargando(false);
    }
  }, [ubicacionUsuarioProps]);

  // Inicializar mapa
  useEffect(() => {
    if (map.current) return;

    const centro = ubicacionUsuario
      ? [ubicacionUsuario.lng, ubicacionUsuario.lat]
      : [-77.0428, -12.0464];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: centro,
      zoom: 18,
    });

    map.current.on('load', () => {
      // Agregar fuente para la ruta
      if (!map.current.getSource('route')) {
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3B82F6',
            'line-width': 4,
            'line-dasharray': [5, 5],
            'line-opacity': 0.8
          }
        });
      }

      routeSourceRef.current = map.current.getSource('route');
    });

    return () => {
      // No destruir el mapa al desmontar
    };
  }, []);

  // Agregar marcador del usuario
  useEffect(() => {
    if (!map.current || !ubicacionUsuario) return;

    // Eliminar marcador anterior
    if (markersRef.current.user) {
      markersRef.current.user.remove();
    }

    const el = document.createElement('div');
    el.className = 'w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg';

    const marker = new mapboxgl.Marker(el)
      .setLngLat([ubicacionUsuario.lng, ubicacionUsuario.lat])
      .addTo(map.current);

    markersRef.current.user = marker;

    // Centrar mapa en usuario
    if (!salonSeleccionado) {
      map.current.easeTo({
        center: [ubicacionUsuario.lng, ubicacionUsuario.lat],
        zoom: 18,
        duration: 500
      });
    }
  }, [ubicacionUsuario]);

  // Agregar marcadores de salones
  useEffect(() => {
    if (!map.current) return;

    // Limpiar marcadores anteriores
    Object.keys(markersRef.current).forEach(key => {
      if (key !== 'user' && markersRef.current[key]) {
        markersRef.current[key].remove();
      }
    });

    salones.forEach(salon => {
      const lat = salon.ubicacion.coordinates[1];
      const lng = salon.ubicacion.coordinates[0];

      const el = document.createElement('div');

      // Determinar color según tipo
      let color = '#3B82F6'; // azul por defecto (aula)
      if (salon.tipo === 'laboratorio') color = '#F97316'; // naranja
      if (salon.tipo === 'auditorio') color = '#EF4444'; // rojo
      if (salon.tipo === 'biblioteca') color = '#8B5CF6'; // púrpura
      if (salon.tipo === 'comedor') color = '#EC4899'; // rosa
      if (salon.tipo === 'baño') color = '#06B6D4'; // cyan
      if (salon.tipo === 'oficina') color = '#6B7280'; // gris

      el.className = `w-10 h-10 rounded-full border-4 border-white shadow-lg cursor-pointer transition-transform hover:scale-110 flex items-center justify-center text-white font-bold`;
      el.style.backgroundColor = color;
      el.innerHTML = salones.indexOf(salon) + 1;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-3">
              <h3 class="font-bold text-lg mb-2">${salon.nombre}</h3>
              <p class="text-sm text-gray-700 mb-1">
                <span class="font-semibold">Tipo:</span> ${salon.tipo}
              </p>
              <p class="text-sm text-gray-700 mb-1">
                <span class="font-semibold">Piso:</span> ${salon.piso}
              </p>
              <p class="text-sm text-gray-700 mb-1">
                <span class="font-semibold">Edificio:</span> ${salon.edificio}
              </p>
              ${salon.capacidad ? `<p class="text-sm text-gray-700 mb-1"><span class="font-semibold">Capacidad:</span> ${salon.capacidad} personas</p>` : ''}
              ${salon.descripcion ? `<p class="text-sm text-gray-600 mt-2">${salon.descripcion}</p>` : ''}
            </div>
          `)
        )
        .addTo(map.current);

      el.addEventListener('click', () => {
        onSalonClick && onSalonClick(salon);
      });

      markersRef.current[salon._id] = marker;
    });
  }, [salones, onSalonClick]);

  // Actualizar ruta cuando hay salón seleccionado
  useEffect(() => {
    if (!map.current || !salonSeleccionado || !ubicacionUsuario) return;

    const coordinates = [
      [ubicacionUsuario.lng, ubicacionUsuario.lat],
      [salonSeleccionado.ubicacion.coordinates[0], salonSeleccionado.ubicacion.coordinates[1]]
    ];

    // Actualizar fuente de ruta
    if (routeSourceRef.current) {
      routeSourceRef.current.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            }
          }
        ]
      });
    }

    // Centrar mapa en salón seleccionado
    map.current.easeTo({
      center: [salonSeleccionado.ubicacion.coordinates[0], salonSeleccionado.ubicacion.coordinates[1]],
      zoom: 19,
      duration: 800
    });
  }, [salonSeleccionado, ubicacionUsuario]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}