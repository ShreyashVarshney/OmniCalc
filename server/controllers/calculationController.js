const Calculation = require('../models/Calculation');
const dbConfig = require('../config/db');

// Helper to generate IDs for fallback records
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
};

// GET /api/calculations
exports.getCalculations = async (req, res) => {
  try {
    const { favorite, search, type, limit = 50 } = req.query;
    const dbStatus = dbConfig.getStatus();

    if (dbStatus.isConnected) {
      const query = {};
      if (favorite === 'true') {
        query.isFavorite = true;
      }
      if (type) {
        query.type = type;
      }
      if (search && search.trim() !== '') {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ expression: regex }, { result: regex }];
      }

      const list = await Calculation.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit));

      return res.json({
        success: true,
        source: 'mongodb',
        count: list.length,
        data: list,
      });
    } else {
      // Fallback local store
      let list = dbConfig.getLocalStore();
      if (favorite === 'true') {
        list = list.filter((item) => item.isFavorite);
      }
      if (type) {
        list = list.filter((item) => item.type === type);
      }
      if (search && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (item) =>
            item.expression.toLowerCase().includes(q) ||
            item.result.toLowerCase().includes(q)
        );
      }
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const sliced = list.slice(0, Number(limit));

      return res.json({
        success: true,
        source: 'in-memory-fallback',
        count: sliced.length,
        data: sliced,
      });
    }
  } catch (error) {
    console.error('Error in getCalculations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/calculations
exports.createCalculation = async (req, res) => {
  try {
    const { expression, result, type = 'standard', category = 'General' } = req.body;

    if (!expression || result === undefined || result === null) {
      return res.status(400).json({
        success: false,
        error: 'Both expression and result are required',
      });
    }

    const dbStatus = dbConfig.getStatus();

    if (dbStatus.isConnected) {
      const calc = await Calculation.create({
        expression: String(expression).trim(),
        result: String(result).trim(),
        type,
        category,
        isFavorite: false,
      });

      return res.status(201).json({
        success: true,
        source: 'mongodb',
        data: calc,
      });
    } else {
      const store = dbConfig.getLocalStore();
      const newCalc = {
        _id: generateId(),
        id: generateId(),
        expression: String(expression).trim(),
        result: String(result).trim(),
        type,
        category,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.unshift(newCalc);
      dbConfig.saveLocalStore(store);

      return res.status(201).json({
        success: true,
        source: 'in-memory-fallback',
        data: newCalc,
      });
    }
  } catch (error) {
    console.error('Error in createCalculation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /api/calculations/:id/favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = dbConfig.getStatus();

    if (dbStatus.isConnected) {
      const calc = await Calculation.findById(id);
      if (!calc) {
        return res.status(404).json({ success: false, error: 'Calculation not found' });
      }

      calc.isFavorite = !calc.isFavorite;
      await calc.save();

      return res.json({
        success: true,
        source: 'mongodb',
        data: calc,
      });
    } else {
      const store = dbConfig.getLocalStore();
      const item = store.find((c) => c._id === id || c.id === id);
      if (!item) {
        return res.status(404).json({ success: false, error: 'Calculation not found' });
      }

      item.isFavorite = !item.isFavorite;
      item.updatedAt = new Date().toISOString();
      dbConfig.saveLocalStore(store);

      return res.json({
        success: true,
        source: 'in-memory-fallback',
        data: item,
      });
    }
  } catch (error) {
    console.error('Error in toggleFavorite:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/calculations/:id
exports.deleteCalculation = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = dbConfig.getStatus();

    if (dbStatus.isConnected) {
      const deleted = await Calculation.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Calculation not found' });
      }

      return res.json({
        success: true,
        message: 'Calculation deleted',
        id,
      });
    } else {
      let store = dbConfig.getLocalStore();
      const initialLength = store.length;
      store = store.filter((c) => c._id !== id && c.id !== id);

      if (store.length === initialLength) {
        return res.status(404).json({ success: false, error: 'Calculation not found' });
      }

      dbConfig.saveLocalStore(store);
      return res.json({
        success: true,
        message: 'Calculation deleted from fallback storage',
        id,
      });
    }
  } catch (error) {
    console.error('Error in deleteCalculation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/calculations
exports.clearAll = async (req, res) => {
  try {
    const dbStatus = dbConfig.getStatus();

    if (dbStatus.isConnected) {
      await Calculation.deleteMany({});
      return res.json({
        success: true,
        message: 'All calculation history cleared from MongoDB',
      });
    } else {
      dbConfig.saveLocalStore([]);
      return res.json({
        success: true,
        message: 'All calculation history cleared from fallback storage',
      });
    }
  } catch (error) {
    console.error('Error in clearAll:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/calculations/stats
exports.getStats = async (req, res) => {
  try {
    const dbStatus = dbConfig.getStatus();

    let total = 0;
    let favorites = 0;
    let standardCount = 0;
    let scientificCount = 0;

    if (dbStatus.isConnected) {
      total = await Calculation.countDocuments();
      favorites = await Calculation.countDocuments({ isFavorite: true });
      standardCount = await Calculation.countDocuments({ type: 'standard' });
      scientificCount = await Calculation.countDocuments({ type: 'scientific' });
    } else {
      const store = dbConfig.getLocalStore();
      total = store.length;
      favorites = store.filter((c) => c.isFavorite).length;
      standardCount = store.filter((c) => c.type === 'standard').length;
      scientificCount = store.filter((c) => c.type === 'scientific').length;
    }

    res.json({
      success: true,
      data: {
        totalCalculations: total,
        favoritesCount: favorites,
        standardCount,
        scientificCount,
        database: dbStatus.isConnected ? 'MongoDB' : 'Fallback File/Memory',
      },
    });
  } catch (error) {
    console.error('Error in getStats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
