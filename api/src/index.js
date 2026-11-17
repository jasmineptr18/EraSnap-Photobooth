import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import pg from 'pg';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {PRICE_IDR,THEMES,validEmail,safeText,newId,newSecret,hashSecret,secureEquals,verifyMidtrans,isSuccessfulPayment,publicOrder} from './helpers.js';
import {makePhotoStrip} from './photo.js';

const {Pool}=pg;
const app=express();
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:10});
const storage=process.env.STORAGE_DIR || path.resolve('storage');
const port=Number(process.env.PORT||4000);
const demoEnabled=process.env.APP_ENV==='development' && process.env.PAYMENT_MODE==='demo' && process.env.ALLOW_DEMO_PAYMENT==='true';
const paymentMode=demoEnabled?'demo':'midtrans';
if(!process.env.DATABASE_URL) throw Error('DATABASE_URL is required');
if(!process.env.INTERNAL_API_KEY || process.env.INTERNAL_API_KEY.length<24) throw Error('Set long INTERNAL_API_KEY in .env');
if(!process.env.N8N_SHARED_SECRET || process.env.N8N_SHARED_SECRET.length<24) throw Error('Set long N8N_SHARED_SECRET in .env');
if(paymentMode==='midtrans' && !process.env.MIDTRANS_SERVER_KEY) throw Error('MIDTRANS_SERVER_KEY required when not running local demo');
await fs.mkdir(storage,{recursive:true});
app.disable('x-powered-by');
app.use(helmet({contentSecurityPolicy:false}));
const allowedOrigins=new Set((process.env.CORS_ORIGIN||'').split(',').map(origin=>origin.trim()).filter(Boolean));
app.use((req,res,next)=>{
 const origin=req.get('origin');
 if(origin&&allowedOrigins.has(origin)){
  res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
 }
 if(req.method==='OPTIONS')return res.sendStatus(204);
 next();
});
app.use(express.json({limit:'120kb'}));
app.use('/api',rateLimit({windowMs:60_000,limit:120,standardHeaders:'draft-7',legacyHeaders:false}));
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const fail=(res,message,code=400)=>res.status(code).json({error:message});
const tokenFrom=req=>req.get('authorization')?.replace(/^Bearer\s+/i,'')||'';
const authenticatedOrder=async(req,res)=>{
 const {rows}=await pool.query('SELECT * FROM orders WHERE id=$1',[req.params.id]);
 const order=rows[0];
 if(!order||!secureEquals(order.secret_hash,hashSecret(tokenFrom(req)))){fail(res,'Order not found or access denied',404);return null;}
 return order;
};
const internalAuth=(req,res,next)=>{
 if(!secureEquals(req.get('x-internal-api-key'),process.env.INTERNAL_API_KEY)) return fail(res,'Forbidden',403);
 next();
};
const isValidPhone=s=>typeof s==='string' && /^[+\d\s().-]{8,30}$/.test(s);
const needsCleanText=(s,max)=>safeText(s,max);
const queue=async(kind,refId,payload)=>{await pool.query('INSERT INTO outbox(kind,ref_id,payload) VALUES($1,$2,$3) ON CONFLICT (kind,ref_id) DO NOTHING',[kind,refId,JSON.stringify(payload)]);};

app.get('/api/health',wrap(async(req,res)=>{await pool.query('SELECT 1');res.json({ok:true,app:'Era Snap'});}));
app.get('/api/config',(req,res)=>res.json({brand:'Era Snap',priceIdr:PRICE_IDR,paymentMode,demo:demoEnabled,maxPhotos:4,maxRetakes:2}));
app.post('/api/orders',wrap(async(req,res)=>{
 const {name,email,phone,theme}=req.body||{};
 if(!needsCleanText(name,80)||!validEmail(email)||!isValidPhone(phone)||!THEMES.has(theme))return fail(res,'Please supply valid name, email, phone, and theme');
 const id=newId(), secret=newSecret();
 await pool.query('INSERT INTO orders(id,secret_hash,name,email,phone,theme,price_idr) VALUES($1,$2,$3,$4,$5,$6,$7)',[id,hashSecret(secret),needsCleanText(name,80),email.toLowerCase(),phone,theme,PRICE_IDR]);
 res.status(201).json({id,accessToken:secret,theme,status:'PENDING',priceIdr:PRICE_IDR});
}));
app.get('/api/orders/:id',wrap(async(req,res)=>{const order=await authenticatedOrder(req,res);if(order)res.json(publicOrder(order));}));

async function applyMidtransStatus(id,status){
 if(isSuccessfulPayment(status)) await pool.query("UPDATE orders SET status='PAID',paid_at=COALESCE(paid_at,NOW()),updated_at=NOW() WHERE id=$1 AND status='PENDING'",[id]);
 else if(['expire','cancel','deny'].includes(status.transaction_status)) await pool.query("UPDATE orders SET status='CANCELLED',updated_at=NOW() WHERE id=$1 AND status='PENDING'",[id]);
}
app.post('/api/orders/:id/pay',wrap(async(req,res)=>{
 const order=await authenticatedOrder(req,res);if(!order)return;
 if(order.status!=='PENDING')return fail(res,'Order already paid or inactive',409);
 if(demoEnabled)return res.json({mode:'demo',message:'Local demo: press Simulate payment to continue'});
 if(order.payment_url)return res.json({mode:'midtrans',redirectUrl:order.payment_url});
 const endpoint=process.env.MIDTRANS_IS_PRODUCTION==='true'?'https://app.midtrans.com/snap/v1/transactions':'https://app.sandbox.midtrans.com/snap/v1/transactions';
 const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Basic '+Buffer.from(process.env.MIDTRANS_SERVER_KEY+':').toString('base64')},body:JSON.stringify({transaction_details:{order_id:order.id,gross_amount:order.price_idr},customer_details:{first_name:order.name,email:order.email,phone:order.phone},item_details:[{id:'TWO-STRIPS',price:order.price_idr,quantity:1,name:'Era Snap - 2 Photo Strips'}]})});
 if(!r.ok){console.error('Midtrans transaction failed',r.status);return fail(res,'Payment gateway is unavailable',502);}
 const data=await r.json();
 if(!data.redirect_url)return fail(res,'Payment redirect URL unavailable',502);
 await pool.query('UPDATE orders SET payment_url=$2 WHERE id=$1',[order.id,data.redirect_url]);
 res.json({mode:'midtrans',redirectUrl:data.redirect_url});
}));
app.post('/api/orders/:id/demo-pay',wrap(async(req,res)=>{
 if(!demoEnabled)return fail(res,'Not available outside local demo',404);
 const order=await authenticatedOrder(req,res);if(!order)return;
 await pool.query("UPDATE orders SET status='PAID',paid_at=NOW(),updated_at=NOW() WHERE id=$1 AND status='PENDING'",[order.id]);
 res.json({status:'PAID',demo:true});
}));
app.post('/api/orders/:id/check-payment',wrap(async(req,res)=>{
 const order=await authenticatedOrder(req,res);if(!order)return;
 if(order.status!=='PENDING'||demoEnabled)return res.json(publicOrder(order));
 const endpoint=process.env.MIDTRANS_IS_PRODUCTION==='true'?'https://api.midtrans.com/v2/':'https://api.sandbox.midtrans.com/v2/';
 const r=await fetch(endpoint+encodeURIComponent(order.id)+'/status',{headers:{Authorization:'Basic '+Buffer.from(process.env.MIDTRANS_SERVER_KEY+':').toString('base64')}});
 if(r.ok)await applyMidtransStatus(order.id,await r.json());
 const {rows}=await pool.query('SELECT * FROM orders WHERE id=$1',[order.id]);res.json(publicOrder(rows[0]));
}));
app.post('/api/webhooks/midtrans',wrap(async(req,res)=>{
 const id=req.body?.order_id;
 if(typeof id!=='string')return fail(res,'Invalid callback');
 const {rows}=await pool.query('SELECT id,price_idr FROM orders WHERE id=$1',[id]);
 if(!rows[0]||!verifyMidtrans(req.body,process.env.MIDTRANS_SERVER_KEY,rows[0]))return fail(res,'Invalid signature',403);
 await applyMidtransStatus(id,req.body);
 res.json({received:true});
}));
const uploader=multer({storage:multer.memoryStorage(),limits:{files:4,fileSize:7*1024*1024,parts:5},fileFilter:(req,file,cb)=>cb(null,['image/jpeg','image/png','image/webp'].includes(file.mimetype))});
app.post('/api/orders/:id/finish',uploader.array('photos',4),wrap(async(req,res)=>{
 const order=await authenticatedOrder(req,res);if(!order)return;
 if(order.status!=='PAID')return fail(res,'Finish is available only after confirmed payment',409);
 if(req.files?.length!==4)return fail(res,'Exactly four valid photos required');
 let composite;
 try{composite=await makePhotoStrip(req.files,{theme:order.theme,id:order.id});}catch(err){return fail(res,'Photos could not be decoded',400);}
 const filePath=path.join(storage,order.id+'.jpg');
 await fs.writeFile(filePath,composite,{flag:'wx'}).catch(async err=>{if(err.code!=='EEXIST')throw err;});
 const result=await pool.query("UPDATE orders SET status='PROCESSING',photo_path=$2,updated_at=NOW() WHERE id=$1 AND status='PAID' RETURNING id",[order.id,filePath]);
 if(!result.rowCount)return fail(res,'Photo session was already submitted',409);
 await queue('delivery',order.id,{orderId:order.id});
 res.status(202).json({status:'PROCESSING',message:'Photo stored privately; Drive workflow queued. Download is locked until completed.'});
}));
app.get('/api/orders/:id/download',wrap(async(req,res)=>{
 const order=await authenticatedOrder(req,res);if(!order)return;
 if(order.status!=='READY'||!order.drive_file_id)return fail(res,'Download locked until Drive upload completes',403);
 if(!order.photo_path||!fsSync.existsSync(order.photo_path))return fail(res,'Photo not available',404);
 res.setHeader('Content-Disposition',`attachment; filename="${order.id}-two-strips.jpg"`);
 res.type('image/jpeg');fsSync.createReadStream(order.photo_path).pipe(res);
}));

app.get('/internal/orders/:id/strip',internalAuth,wrap(async(req,res)=>{
 const {rows}=await pool.query('SELECT * FROM orders WHERE id=$1',[req.params.id]);const o=rows[0];
 if(!o?.photo_path||!['PROCESSING','READY'].includes(o.status))return fail(res,'Not ready',404);
 res.type('image/jpeg');fsSync.createReadStream(o.photo_path).pipe(res);
}));
app.post('/internal/orders/:id/ready',internalAuth,wrap(async(req,res)=>{
 const {fileId}=req.body||{};
 if(typeof fileId!=='string'||!/^[\w-]{10,200}$/.test(fileId))return fail(res,'Invalid Drive file ID');
 const link=`https://drive.google.com/file/d/${fileId}/view`;
 const {rows}=await pool.query("UPDATE orders SET status='READY',drive_file_id=$2,drive_link=$3,completed_at=NOW(),updated_at=NOW() WHERE id=$1 AND status='PROCESSING' RETURNING id",[req.params.id,fileId,link]);
 if(!rows.length){const old=await pool.query('SELECT id,status,drive_file_id FROM orders WHERE id=$1',[req.params.id]);if(old.rows[0]?.status==='READY' && old.rows[0].drive_file_id===fileId)return res.json({ok:true,idempotent:true});return fail(res,'Invalid state transition',409);}
 res.json({ok:true,driveLink:link});
}));
app.post('/api/b2b/inquiry',wrap(async(req,res)=>{
 const {company,contactName,email,phone,eventType,eventDate,message}=req.body||{};
 if(!needsCleanText(company,120)||!needsCleanText(contactName,80)||!validEmail(email)||!isValidPhone(phone)||!needsCleanText(eventType,80))return fail(res,'Complete all required event enquiry fields');
 const date=typeof eventDate==='string'&&/^\d{4}-\d\d-\d\d$/.test(eventDate)?eventDate:null;
 const {rows}=await pool.query('INSERT INTO b2b_leads(company,contact_name,email,phone,event_type,event_date,message) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id',[needsCleanText(company,120),needsCleanText(contactName,80),email.toLowerCase(),phone,needsCleanText(eventType,80),date,needsCleanText(message,1200)]);
 await queue('lead',String(rows[0].id),{leadId:rows[0].id});
 res.status(201).json({received:true,leadId:rows[0].id});
}));
app.get('/internal/leads/:id',internalAuth,wrap(async(req,res)=>{const {rows}=await pool.query('SELECT * FROM b2b_leads WHERE id=$1',[req.params.id]);if(!rows[0])return fail(res,'Not found',404);res.json(rows[0]);}));
app.get('/internal/orders/:id/meta',internalAuth,wrap(async(req,res)=>{const {rows}=await pool.query('SELECT id,name,email,phone,theme,price_idr,created_at FROM orders WHERE id=$1',[req.params.id]);if(!rows[0])return fail(res,'Not found',404);res.json(rows[0]);}));
app.get('/internal/ops-summary',internalAuth,wrap(async(req,res)=>{
 const {rows}=await pool.query("SELECT COUNT(*)::int total,COUNT(*) FILTER (WHERE status='READY')::int completed,COUNT(*) FILTER (WHERE status='PROCESSING')::int processing,COALESCE(SUM(price_idr) FILTER (WHERE status IN ('PAID','PROCESSING','READY')),0)::bigint revenue_idr FROM orders WHERE created_at >= NOW() - INTERVAL '30 days'");
 const leads=await pool.query("SELECT COUNT(*)::int leads FROM b2b_leads WHERE created_at >= NOW() - INTERVAL '30 days'");res.json({...rows[0],leads:leads.rows[0].leads,period:'Last 30 days'});
}));
app.post('/internal/ai/ops-summary',internalAuth,wrap(async(req,res)=>{
 if(!process.env.HERMES_API_KEY)return fail(res,'Hermes not configured',503);
 const stats=await pool.query("SELECT COUNT(*)::int total,COUNT(*) FILTER (WHERE status='READY')::int completed,COUNT(*) FILTER (WHERE status='PROCESSING')::int processing,COALESCE(SUM(price_idr) FILTER (WHERE status IN ('PAID','PROCESSING','READY')),0)::bigint revenue_idr FROM orders WHERE created_at >= NOW() - INTERVAL '30 days'");
 const prompt=`Create a concise Indonesian operations report with 3 actionable insights. Aggregated anonymized metrics ONLY: ${JSON.stringify(stats.rows[0])}. Do not invent customers or send messages.`;
 const url=process.env.HERMES_API_URL;
 const r=await fetch(url,{method:'POST',signal:AbortSignal.timeout(55_000),headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.HERMES_API_KEY}`},body:JSON.stringify({model:'hermes-agent',messages:[{role:'user',content:prompt}],stream:false})});
 if(!r.ok)return fail(res,'Hermes gateway unavailable',502);
 const data=await r.json();res.json({summary:String(data.choices?.[0]?.message?.content||'No summary').slice(0,4000)});
}));

let dispatching=false;
async function dispatchOutbox(){
 if(dispatching)return;
 dispatching=true;
 try{
 const q=await pool.query('SELECT id,kind,ref_id,payload,attempts FROM outbox WHERE sent_at IS NULL AND next_attempt<=NOW() ORDER BY id LIMIT 10');
 for(const row of q.rows){
  const url=row.kind==='delivery'?process.env.N8N_DELIVERY_WEBHOOK:process.env.N8N_LEADS_WEBHOOK;
  if(!url)continue;
  try{
   const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','x-fotobox-secret':process.env.N8N_SHARED_SECRET},body:JSON.stringify(row.payload),signal:AbortSignal.timeout(10_000)});
   if(!r.ok)throw Error(`HTTP ${r.status}`);
   await pool.query('UPDATE outbox SET sent_at=NOW(),attempts=attempts+1,last_error=NULL WHERE id=$1',[row.id]);
  }catch(err){await pool.query("UPDATE outbox SET attempts=attempts+1,last_error=$2,next_attempt=NOW()+ (LEAST(POWER(2,LEAST(attempts,8)),300)::int || ' seconds')::interval WHERE id=$1",[row.id,String(err.message).slice(0,400)]);}
 }
 }catch(err){console.error('Outbox worker',err.message);}finally{dispatching=false;}
}
// Requeue processing orders that never received a Drive callback (idempotency needs workflow operator review).
const publicDir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
app.use(express.static(publicDir,{index:false,maxAge:'1h'}));
app.get('*',(req,res)=>{if(req.path.startsWith('/api/')||req.path.startsWith('/internal/'))return fail(res,'Not found',404);res.sendFile(path.join(publicDir,'index.html'));});
app.use((err,req,res,next)=>{console.error(err.message);if(err.code==='LIMIT_FILE_SIZE')return fail(res,'Image must be smaller than 7 MB',413);if(err instanceof multer.MulterError)return fail(res,err.message);fail(res,'Server error',500);});
setInterval(dispatchOutbox,10_000).unref();
app.listen(port,'0.0.0.0',()=>{console.log(`Era Snap API listening on ${port} (${paymentMode})`);dispatchOutbox();});
