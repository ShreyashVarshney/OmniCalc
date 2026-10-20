const API_BASE = '/api';

export const api = {
  // Fetch calculation history
  async getCalculations(params = {}) {
    const query = new URLSearchParams();
    if (params.favorite !== undefined) query.append('favorite', params.favorite);
    if (params.search) query.append('search', params.search);
    if (params.type) query.append('type', params.type);
    if (params.limit) query.append('limit', params.limit);

    const res = await fetch(`${API_BASE}/calculations?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch calculations');
    return await res.json();
  },

  // Save new calculation
  async createCalculation(calcData) {
    const res = await fetch(`${API_BASE}/calculations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(calcData),
    });
    if (!res.ok) throw new Error('Failed to save calculation');
    return await res.json();
  },

  // Toggle favorite status
  async toggleFavorite(id) {
    const res = await fetch(`${API_BASE}/calculations/${id}/favorite`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to toggle favorite');
    return await res.json();
  },

  // Delete individual calculation
  async deleteCalculation(id) {
    const res = await fetch(`${API_BASE}/calculations/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete calculation');
    return await res.json();
  },

  // Clear all history
  async clearAll() {
    const res = await fetch(`${API_BASE}/calculations`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to clear history');
    return await res.json();
  },

  // Get statistics
  async getStats() {
    const res = await fetch(`${API_BASE}/calculations/stats`);
    if (!res.ok) throw new Error('Failed to fetch statistics');
    return await res.json();
  },

  // Get backend & database connection status
  async getStatus() {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) throw new Error('Failed to fetch status');
    return await res.json();
  },
};
