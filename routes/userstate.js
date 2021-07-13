import express from 'express';
import UserState from '../controllers/userstate';

const router = express.Router();

router.post('/', UserState.createUser);

export default router;



////////////////