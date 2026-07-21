

import   express      from  'express';
import    helmet   from  'helmet';
import   {   safeQuery  }   =  require('../../shared/database')
import    {    Requet  ,  Response  ,  NextFunctionn}   from  'express'
import   Logger    from  '../../packages/shared-logger/dist/index';

const app = express();
const PORT = process.env.PORT || 8115;

app.use(helmet());
app.use(express.json());

// Tenant Resolution Middleware
app.use (   req:   request   ,   res:   Response) :  Promise <Response>  =>{
const  tenantSlug   =    req .headers['X-tenant-slug']   ||    
}


// Health check
app.get('/health', (req:  Request    ,  res  :   Response): Promise   <Response>   =>{

}


app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`invoice-service is running on port ${PORT}`);
});
