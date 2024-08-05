import express, { Router, Request, Response, NextFunction} from 'express';

const router: Router = express.Router();

async function readVariables(request: Request, response: Response, next: NextFunction) {
  //const Variable = await request.collection.read('Variable');
  response.send('/GET, Variable');
}

async function createVariable(request: Request, response: Response, next: NextFunction) {}
async function updateVariable(request: Request, response: Response, next: NextFunction) { }
async function deleteVariable(request: Request, response: Response, next: NextFunction) { }

router.post('/variable', createVariable);
router.get('/variable/:resourceId', readVariables);
router.patch('/variable/:resourceId', updateVariable);
router.delete('/variable/:resourceId', deleteVariable);

export default router;
