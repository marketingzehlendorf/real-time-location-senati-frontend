import SalonCard from './SalonCard';

export default function SalonList({ salones, onSelectSalon, salonSeleccionado, onNavigate }) {
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
      {salones.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No se encontraron salones</p>
        </div>
      ) : (
        salones.map((salon) => (
          <SalonCard
            key={salon._id}
            salon={salon}
            onSelect={onSelectSalon}
            onNavigate={onNavigate}
            seleccionado={salonSeleccionado?._id === salon._id}
          />
        ))
      )}
    </div>
  );
}