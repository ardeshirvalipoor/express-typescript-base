import { Router, Request, Response, NextFunction } from 'express';
import * as Hi from '../controllers/hi-controller'
import { logger } from '../services/logger-service';

// import { requireAuth } from '../services/auth-service'

logger('R1', global.MONGODB_URI)
let router = Router()
logger('R2', global.MONGODB_URI)


router.get('/', Hi.getPosts);
logger('R3', global.MONGODB_URI)
// router.get('/:file', Hi.getFile);
// router.post('/sheets/:docid', Api.postRows);
// router.post('/sheets/:docid/:tabid', Api.updateTab);
// router.get('/', requireAuth, Auth.roleAuthorization(['reader','creator','editor']), TodoController.getTodos);
// router.post('/', requireAuth, Auth.roleAuthorization(['creator','editor']), TodoController.createTodo);
// router.delete('/:todo_id', requireAuth, Auth.roleAuthorization(['editor']), TodoController.deleteTodo);
 
  
export default router