import { Router } from 'express';
import { getVisitorStats, getPageViews, getRecentVisitors } from '../controllers/visitorController';

const router = Router();

// GET /api/visitors/stats - Get visitor statistics
router.get('/stats', getVisitorStats);

// GET /api/visitors/page/:page - Get page-specific views
router.get('/page/:page', getPageViews);

// GET /api/visitors/recent - Get recent visitors
router.get('/recent', getRecentVisitors);

export default router;
