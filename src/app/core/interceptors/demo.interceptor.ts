import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

const now = () => new Date().toISOString();
const id = () => (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));

const DEMO_EMAIL = 'demo@integrydt.local';
const DEMO_PASSWORD = 'Demo1234!';
const ALL_PERMISSIONS = ['devices.read','devices.manage','users.manage','roles.manage','audit.read','tools.read','tools.execute','jobs.read','notifications.send'];

const devices = [
  { id:'demo-device-01', name:'DESKTOP-DEMO-01', status:'online', os:'Windows 11 Pro', architecture:'x64', agentVersion:'0.3.0', lastSeenAt:now() },
  { id:'demo-device-02', name:'LAPTOP-DESARROLLO', status:'online', os:'Windows 11 Pro', architecture:'x64', agentVersion:'0.3.0', lastSeenAt:now() },
  { id:'demo-device-03', name:'QA-WORKSTATION', status:'offline', os:'Windows 10 Pro', architecture:'x64', agentVersion:'0.2.0', lastSeenAt:new Date(Date.now()-3600000).toISOString() }
];
const catalog = [
  ['system-info','Información del sistema','system-info','System Info','low','1.0.0'],
  ['desktop-notifications','Notificaciones','desktop-notifications','Desktop Notifications','low','1.0.0'],
  ['repository-manager','Repositorios Git','repository-manager','Repository Manager','medium','1.0.0'],
  ['sftp-files','SFTP','sftp-files','SFTP Files','high','1.0.0'],
  ['script-runner','Scripts','script-runner','Script Runner','high','1.0.0'],
  ['screen-recorder','Screen Recorder','screen-recorder','Screen Recorder','high','1.0.0'],
  ['input-automation','Clic y teclado','input-automation','Input Automation','critical','1.1.0']
].map(x=>({toolCode:x[0],toolName:x[1],gadgetCode:x[2],gadgetName:x[3],riskLevel:x[4],version:x[5],status:'published'}));

let repos:any[]=[{id:'repo-demo-01',name:'Frontend WEB',localPath:'C:\\Demo\\IntegryDT\\Frontend WEB',createdAt:now()}];
let scripts:any[]=[{id:'script-demo-01',name:'Diagnóstico rápido',runtime:'powershell',sha256:'d34db33fd34db33fd34db33fd34db33fd34db33fd34db33fd34db33fd34db33f',timeoutSeconds:30,enabled:true,createdAt:now()}];
let sftpProfiles:any[]=[{id:'sftp-demo-01',name:'Servidor staging',host:'staging.integry.local',port:22,username:'deploy',remotePath:'/var/www/app',identityFilePath:'C:\\Users\\demo\\.ssh\\id_ed25519'}];
let sequences:any[]=[{id:'seq-demo-01',name:'Abrir panel de prueba',stepsJson:'[{"type":"delay","ms":500},{"type":"keypress","key":"ESC"}]',enabled:true,createdAt:now()}];
let notifications:any[]=[
  {id:'notif-demo-01',title:'Despliegue completado',body:'La versión demo fue desplegada correctamente.',priority:'normal',createdAt:now(),deviceId:'demo-device-01',deviceName:'DESKTOP-DEMO-01',deviceStatus:'online',jobId:'job-demo-notif-01',deliveryStatus:'success',startedAt:now(),finishedAt:now(),error:null}
];
const jobs = new Map<string, any>();

function response(body:any,status=200){ return of(new HttpResponse({status,body})); }
function unauthorized(){ return throwError(()=>new HttpErrorResponse({status:401,error:{error:'invalid_credentials'}})); }
function resultFor(tool:string){
  const data:any = {
    'system-info': { hostname:'DESKTOP-DEMO-01', os:'Windows 11 Pro', architecture:'x64', framework:'.NET 9', clientVersion:'0.3.0', disks:[{name:'C:',freeGb:184,totalGb:476}] },
    'repository-manager': { branch:'main', clean:true, ahead:0, behind:0, message:'Repositorio sincronizado' },
    'script-runner': { exitCode:0, stdout:'Demo script completed successfully', durationMs:842 },
    'sftp-files': { path:'/var/www/app', entries:[{name:'releases',type:'directory'},{name:'current',type:'directory'},{name:'README.md',type:'file'}] },
    'screen-recorder': { durationSeconds:5, frameCount:5, resolution:'1920x1080', artifactPath:'demo-recording.zip' },
    'input-automation': { executed:3, completed:true, durationMs:1240 },
    'desktop-notifications': { displayed:true, title:'Integry DT Demo', priority:'normal' }
  };
  return data[tool] ?? { ok:true, message:'Ejecución simulada completada' };
}

export const demoInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) return next(req);
  const url=req.url.split('?')[0];

  if(req.method==='POST' && url==='/api/v1/auth/login'){
    const b:any=req.body;
    if((b?.email??'').toLowerCase()!==DEMO_EMAIL || b?.password!==DEMO_PASSWORD) return unauthorized();
    return response({accessToken:'demo-token',expiresAtUtc:new Date(Date.now()+86400000).toISOString(),user:{id:'demo-user-01',email:DEMO_EMAIL,displayName:'Usuario Demo'},company:{id:'demo-company-01',name:'Integry DT Demo',slug:'integry-dt-demo'},roles:['admin'],permissions:ALL_PERMISSIONS});
  }
  if(req.method==='POST' && url==='/api/v1/auth/switch-company') return response({accessToken:'demo-token',expiresAtUtc:new Date(Date.now()+86400000).toISOString(),user:{id:'demo-user-01',email:DEMO_EMAIL,displayName:'Usuario Demo'},company:{id:'demo-company-01',name:'Integry DT Demo',slug:'integry-dt-demo'},roles:['admin'],permissions:ALL_PERMISSIONS});
  if(req.method==='GET' && url==='/api/v1/devices') return response(devices);
  if(req.method==='GET' && url==='/api/v1/catalog/tools') return response(catalog);
  if(req.method==='GET' && url==='/api/v1/admin/members') return response([
    {id:'demo-user-01',email:DEMO_EMAIL,displayName:'Usuario Demo',status:'active',roles:'admin'},
    {id:'demo-user-02',email:'lider@integrydt.local',displayName:'Laura Líder',status:'active',roles:'leader'},
    {id:'demo-user-03',email:'dev@integrydt.local',displayName:'Diego Developer',status:'active',roles:'developer'}
  ]);
  if(req.method==='GET' && url==='/api/v1/admin/roles') return response([
    {id:'role-admin',code:'admin',name:'Administrador',description:'Control total del tenant',permissions:ALL_PERMISSIONS.join(',')},
    {id:'role-leader',code:'leader',name:'Líder',description:'Operación y supervisión',permissions:'devices.read,tools.read,tools.execute,jobs.read,notifications.send,audit.read'},
    {id:'role-dev',code:'developer',name:'Developer',description:'Herramientas de desarrollo',permissions:'devices.read,tools.read,tools.execute,jobs.read'}
  ]);

  if(req.method==='GET' && url==='/api/v1/phase6/repositories') return response(repos);
  if(req.method==='POST' && url==='/api/v1/phase6/repositories'){ const b:any=req.body; const x={id:id(),name:b.name,localPath:b.localPath,createdAt:now()};repos=[...repos,x];return response(x,201); }
  if(req.method==='GET' && url==='/api/v1/phase6/scripts') return response(scripts);
  if(req.method==='POST' && url==='/api/v1/phase6/scripts'){ const b:any=req.body;const x={id:id(),name:b.name,runtime:'powershell',sha256:'demo'+Math.random().toString(16).slice(2).padEnd(60,'0'),timeoutSeconds:b.timeoutSeconds??30,enabled:true,createdAt:now()};scripts=[...scripts,x];return response(x,201); }
  if(req.method==='GET' && url==='/api/v1/phase6/sftp-profiles') return response(sftpProfiles);
  if(req.method==='POST' && url==='/api/v1/phase6/sftp-profiles'){ const b:any=req.body;const x={id:id(),...b};sftpProfiles=[...sftpProfiles,x];return response(x,201); }
  if(req.method==='GET' && url==='/api/v1/phase6/automation-sequences') return response(sequences);
  if(req.method==='POST' && url==='/api/v1/phase6/automation-sequences'){ const b:any=req.body;const x={id:id(),name:b.name,stepsJson:JSON.stringify(b.steps),enabled:true,createdAt:now()};sequences=[...sequences,x];return response(x,201); }

  if(req.method==='POST' && url==='/api/v1/notifications/send'){
    const b:any=req.body; const items=(b.deviceIds??[]).map((deviceId:string)=>{const d=devices.find(x=>x.id===deviceId)!;const jobId='job-'+id();notifications=[{id:id(),title:b.title,body:b.body,priority:b.priority,createdAt:now(),deviceId,deviceName:d?.name??'Equipo Demo',deviceStatus:d?.status??'online',jobId,deliveryStatus:'success',startedAt:now(),finishedAt:now(),error:null},...notifications];return {notificationId:id(),jobId,deviceId,deviceName:d?.name??'Equipo Demo',status:'queued'};});return response({count:items.length,items},202);
  }
  if(req.method==='GET' && url==='/api/v1/notifications/sent') return response(notifications);

  if(req.method==='POST' && url==='/api/v1/jobs'){
    const b:any=req.body; const jid='job-'+id(); const device=devices.find(x=>x.id===b.deviceId)??devices[0]; const tool=catalog.find(x=>x.toolCode===b.toolCode); jobs.set(jid,{id:jid,action:b.action,status:'success',deviceName:device.name,toolCode:b.toolCode,gadgetCode:tool?.gadgetCode??b.toolCode,version:tool?.version??'1.0.0',resultJson:JSON.stringify(resultFor(b.toolCode)),stderr:null,createdAt:now(),finishedAt:now()}); return response({id:jid,status:'queued'},202);
  }
  const jobMatch=url.match(/^\/api\/v1\/jobs\/([^/]+)$/);
  if(req.method==='GET' && jobMatch) return response(jobs.get(jobMatch[1])??{id:jobMatch[1],status:'success',resultJson:JSON.stringify({ok:true})});
  const eventMatch=url.match(/^\/api\/v1\/jobs\/([^/]+)\/events$/);
  if(req.method==='GET' && eventMatch) return response([{type:'queued',message:'Job demo encolado',createdAt:now()},{type:'running',message:'Ejecución simulada',createdAt:now()},{type:'success',message:'Completado correctamente',createdAt:now()}]);
  const cancelMatch=url.match(/^\/api\/v1\/jobs\/([^/]+)\/cancel$/);
  if(req.method==='POST' && cancelMatch){const j=jobs.get(cancelMatch[1]);if(j)j.status='cancelled';return response({id:cancelMatch[1],status:'cancelled'});}
  const artifactsMatch=url.match(/^\/api\/v1\/jobs\/([^/]+)\/artifacts$/);
  if(req.method==='GET' && artifactsMatch) return response([{id:'artifact-demo-01',filename:'recording-demo.zip',contentType:'application/zip',sizeBytes:2483921,sha256:'demo-sha256',createdAt:now(),expiresAt:new Date(Date.now()+7*86400000).toISOString()}]);
  if(req.method==='GET' && /^\/api\/v1\/artifacts\/[^/]+\/download$/.test(url)) return response(new Blob(['Integry DT demo artifact'],{type:'application/zip'}));

  return response({});
};
