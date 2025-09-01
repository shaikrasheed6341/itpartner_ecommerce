import { Router } from 'express';
import { 
  submitContactForm, 
  getAllContactSubmissions, 
  getContactSubmissionById 
} from '../controllers/contactcontroller';

const router = Router();

// POST /api/contact/submit - Submit contact form
router.post('/submit', submitContactForm);

// GET /api/contact/submissions - Get all contact submissions (admin)
router.get('/submissions', getAllContactSubmissions);

// GET /api/contact/submissions/:id - Get specific contact submission (admin)
router.get('/submissions/:id', getContactSubmissionById);

export default router;
