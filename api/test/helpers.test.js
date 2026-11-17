import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {newId,newSecret,hashSecret,secureEquals,verifyMidtrans,isSuccessfulPayment,PRICE_IDR,validEmail} from '../src/helpers.js';
test('order IDs and secrets unique, valid',()=>{assert.match(newId(),/^JSM-[A-F0-9]{16}$/);assert.notEqual(newSecret(),newSecret());assert.equal(hashSecret('abc').length,64);});
test('safe comparison',()=>{assert.equal(secureEquals('abc','abc'),true);assert.equal(secureEquals('abc','abd'),false);assert.equal(secureEquals('abc','abcd'),false);});
test('midtrans signed callback accepts only expected amount and order',()=>{const p={order_id:'JSM-TEST',status_code:'200',gross_amount:'15000.00',transaction_status:'settlement'};p.signature_key=crypto.createHash('sha512').update(`${p.order_id}${p.status_code}${p.gross_amount}server-key`).digest('hex');const order={id:'JSM-TEST',price_idr:15000};assert.ok(verifyMidtrans(p,'server-key',order));assert.equal(verifyMidtrans({...p,gross_amount:'1.00'},'server-key',order),false);assert.equal(verifyMidtrans(p,'wrong',order),false);assert.ok(isSuccessfulPayment(p));assert.ok(!isSuccessfulPayment({transaction_status:'capture',fraud_status:'challenge'}));});
test('prices and email',()=>{assert.equal(PRICE_IDR,15000);assert.ok(validEmail('a@b.co'));assert.ok(!validEmail('bad'));});
