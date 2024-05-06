import { Router } from 'express';
import protectRoute from '../../middlewares/protectRoute';
import { checkReport } from '../../middlewares/checkReports';
import { deleteComment, editComment, getProductComments, likeComment, newComment, replay } from '../../controllers/shop/comment.controller';

const router = Router();

router.post('/new/:id', [protectRoute, checkReport], newComment);

router.put('/replay/:id', [protectRoute, checkReport], replay);

router.put('/edit/:id', protectRoute, editComment);

router.delete('/del/:id', protectRoute, deleteComment);

router.put('/like/:id', [protectRoute, checkReport], likeComment);

router.get('/:id', protectRoute, getProductComments);


export default router;