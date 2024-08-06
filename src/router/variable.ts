import express, { Router, Request, Response, NextFunction} from 'express';

const router: Router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

async function readVariables(request: Request, response: Response, next: NextFunction) {
  //const Variable = await request.collection.read('Variable');
  response.send('/GET, Variable');
}

async function createVariable(request: Request, response: Response, next: NextFunction) {
  try {
    const variableRecord = await request.collection.write('Variable', {
      type: request.body.type,
      key: request.body.key,
      value: request.body.value
    });
    response.status(201).json({ resourceId: variableRecord.id });
  } catch (e) {
    console.log(e);
    next({ message: 'Variable Router Error: unable to create variable record' , error: e });
  }
}
async function updateVariable(request: Request, response: Response, next: NextFunction) {}
async function deleteVariable(request: Request, response: Response, next: NextFunction) { }

router.post('/variable', createVariable);
router.get('/variable/:resourceId', readVariables);
router.patch('/variable/:resourceId', updateVariable);
router.delete('/variable/:resourceId', deleteVariable);

export default router;
