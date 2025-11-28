export default function SalonCard({ salon, onSelect, seleccionado, onNavigate }) {
    const obtenerColorTipo = (tipo) => {
      const colores = {
        aula: 'bg-blue-100 text-blue-800',
        laboratorio: 'bg-orange-100 text-orange-800',
        auditorio: 'bg-red-100 text-red-800',
        biblioteca: 'bg-purple-100 text-purple-800',
        oficina: 'bg-gray-100 text-gray-800'
      };
      return colores[tipo] || 'bg-blue-100 text-blue-800';
    };
  
    const obtenerColorEstado = (estado) => {
      const colores = {
        disponible: 'bg-green-100 text-green-800',
        mantenimiento: 'bg-yellow-100 text-yellow-800',
        cerrado: 'bg-red-100 text-red-800'
      };
      return colores[estado] || 'bg-gray-100 text-gray-800';
    };
  
    return (
      <div
        onClick={() => onSelect(salon)}
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
          seleccionado
            ? 'border-blue-500 bg-blue-50 shadow-lg'
            : 'border-gray-200 bg-white hover:shadow-md'
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800">{salon.nombre}</h3>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${obtenerColorTipo(salon.tipo)}`}>
            {salon.tipo}
          </span>
        </div>
  
        <p className="text-sm text-gray-600 mb-2">{salon.edificio} - Piso {salon.piso}</p>
  
        {salon.descripcion && (
          <p className="text-sm text-gray-700 mb-2">{salon.descripcion}</p>
        )}
  
        <div className="flex gap-2 flex-wrap mb-2">
          {salon.capacidad && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              👥 {salon.capacidad} personas
            </span>
          )}
          <span className={`text-xs font-semibold px-2 py-1 rounded ${obtenerColorEstado(salon.estado)}`}>
            {salon.estado}
          </span>
        </div>
  
        <div className="text-xs text-gray-500 mb-3">
          📍 {salon.ubicacion.coordinates[1].toFixed(4)}, {salon.ubicacion.coordinates[0].toFixed(4)}
        </div>
  
        {seleccionado && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate && onNavigate(salon);
            }}
            className="w-full bg-green-500 text-white py-2 rounded font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
          >
            🧭 Ir al Salón
          </button>
        )}
      </div>
    );
  }