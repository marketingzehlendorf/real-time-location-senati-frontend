import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const salonService = {
  // Obtener todos los salones
  obtenerTodos: async () => {
    try {
      const response = await api.get('/salones');
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo salones:', error);
      throw error;
    }
  },

  // Obtener salón por ID
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/salones/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo salón:', error);
      throw error;
    }
  },

  // Buscar salones por nombre o tipo
  buscar: async (query, tipo = null) => {
    try {
      const params = { q: query };
      if (tipo) params.tipo = tipo;
      const response = await api.get('/salones/buscar', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error buscando salones:', error);
      throw error;
    }
  },

  // Obtener salones cercanos
  obtenerCercanos: async (latitud, longitud, distancia = 1000) => {
    try {
      const response = await api.get('/salones/cercanos', {
        params: {
          latitud,
          longitud,
          distancia
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo salones cercanos:', error);
      throw error;
    }
  },

  // Obtener salones por piso
  obtenerPorPiso: async (piso) => {
    try {
      const response = await api.get(`/salones/piso/${piso}`);
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo salones por piso:', error);
      throw error;
    }
  },

  // Crear salón
  crear: async (salonData) => {
    try {
      const response = await api.post('/salones', salonData);
      return response.data.data;
    } catch (error) {
      console.error('Error creando salón:', error);
      throw error;
    }
  },

  // Actualizar salón
  actualizar: async (id, salonData) => {
    try {
      const response = await api.put(`/salones/${id}`, salonData);
      return response.data.data;
    } catch (error) {
      console.error('Error actualizando salón:', error);
      throw error;
    }
  },

  // Eliminar salón
  eliminar: async (id) => {
    try {
      const response = await api.delete(`/salones/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando salón:', error);
      throw error;
    }
  }
};