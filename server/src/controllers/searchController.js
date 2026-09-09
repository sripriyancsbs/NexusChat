import { searchAll } from '../services/searchService.js';
import { logger } from '../utils/logger.js';

export const handleSearch = async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q.trim()) {
      return res.status(200).json({
        query: '',
        messages: [],
        channels: [],
        people: []
      });
    }

    const results = await searchAll(req.user.id, q);
    return res.status(200).json(results);
  } catch (err) {
    logger.error('Search controller error', { error: err.message });
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to complete search operation.'
    });
  }
};
