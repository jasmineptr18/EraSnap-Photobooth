import crypto from 'node:crypto';
export const PRICE_IDR = 15000;
export const THEMES = new Set(['debut','fearless','speak-now','red','1989','reputation','lover','folklore','evermore','midnights','ttpd','1989-vault','red-tv','speak-now-tv','fearless-tv']);
export function validEmail(value) { return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 180; }
export function safeText(value, n=80) { return typeof value === 'string' ? value.trim().slice(0,n) : ''; }
export function newId() { return 'JSM-'+crypto.randomBytes(8).toString('hex').toUpperCase(); }
export function newSecret() { return crypto.randomBytes(32).toString('hex'); }
export function hashSecret(secret) { return crypto.createHash('sha256').update(secret).digest('hex'); }
export function secureEquals(a,b) { if(typeof a!== 'string'||typeof b!=='string') return false;const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&crypto.timingSafeEqual(x,y); }
export function verifyMidtrans(payload, serverKey, expectedOrder) {
 if(!serverKey || !payload?.signature_key || !payload.order_id || !payload.status_code || !payload.gross_amount) return false;
 if(payload.order_id!==expectedOrder.id || Number(payload.gross_amount)!==Number(expectedOrder.price_idr)) return false;
 const computed=crypto.createHash('sha512').update(`${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`).digest('hex');
 return secureEquals(computed, payload.signature_key);
}
export function isSuccessfulPayment(payload) {
 return payload.transaction_status==='settlement' || (payload.transaction_status==='capture' && payload.fraud_status!=='deny' && payload.fraud_status!=='challenge');
}
export function xmlEscape(s) { return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;'); }
export function publicOrder(row) { return {id:row.id,theme:row.theme,package:row.package_code,price:row.price_idr,status:row.status,driveLink:row.status==='READY'?row.drive_link:null,canDownload:row.status==='READY',createdAt:row.created_at}; }
