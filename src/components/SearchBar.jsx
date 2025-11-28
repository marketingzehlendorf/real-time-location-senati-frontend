import { useState } from 'react';

export default function SearchBar({ onSearch, onFiltroTipo }) {
  const [busqueda, setBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');

  const handleBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    onSearch(valor);
  };

  const handleTipo = (e) => {
    const valor = e.target.value;
    setTipoFiltro(valor);
    onFiltroTipo(valor);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Buscar salón por nombre..."
          value={busqueda}
          onChange={handleBusqueda}
          className="flex-1 min-w-[250px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <select
          value={tipoFiltro}
          onChange={handleTipo}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los tipos</option>
          <option value="aula">Aula</option>
          <option value="laboratorio">Laboratorio</option>
          <option value="auditorio">Auditorio</option>
          <option value="biblioteca">Biblioteca</option>
          <option value="oficina">Oficina</option>
          <option value="conferencia">Conferencia</option>
        </select>
      </div>
    </div>
  );
}