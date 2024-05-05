import { Router } from 'express';
import protectRoute from '../middlewares/protectRoute';
import { checkReport } from '../middlewares/checkReports';
import { deleteComment, editComment, newComment, replay } from '../controllers/comment.controller';

const router = Router();

router.post('/new/:id', [protectRoute, checkReport], newComment);

router.put('/replay/:id', [protectRoute, checkReport], replay);

router.put('/edit/:id', [protectRoute, checkReport], editComment);

router.delete('/del/:id', [protectRoute, checkReport], deleteComment);


export default router;