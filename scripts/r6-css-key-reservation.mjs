// Durable metadata reservation only; no key material, upload, activation or execution.
import assert from 'node:assert/strict';
import {productionBindingPlan,buildProductionInspectionBootstrap} from './r6-css-operator.mjs';
import {productionKeyReservationProfile} from './release-r6-css-adapter.mjs';

export const keyReservationIntentProtocol='r6-css-key-reservation-intent-v1';
export function validateKeyReservationIntent(i){
 assert.ok(i&&Object.getPrototypeOf(i)===Object.prototype,'Plain key reservation intent required');
 assert.deepEqual(Object.keys(i).sort(),['candidateFingerprint','expectedActiveFingerprint','kind','operationId','protocol','target'],'Key reservation intent fields differ');
 assert.equal(i.protocol,keyReservationIntentProtocol);assert.equal(i.target,productionBindingPlan().home);
 const hex=(v,n)=>typeof v==='string'&&v.length===n&&!/[^a-f0-9]/.test(v);
 assert.ok(hex(i.operationId,32)&&hex(i.candidateFingerprint,64)&&['initial','rotation'].includes(i.kind),'Key reservation identity differs');
 assert.ok(i.kind==='initial'?i.expectedActiveFingerprint===null:hex(i.expectedActiveFingerprint,64)&&i.expectedActiveFingerprint!==i.candidateFingerprint,'Key reservation active fingerprint differs');return Object.fromEntries(['protocol','target','operationId','kind','expectedActiveFingerprint','candidateFingerprint'].map(k=>[k,i[k]]));
}
export function buildProductionKeyReservationBootstrap(mode,a,intent,...extra){
 assert.equal(extra.length,0,'Key reservation overrides refused');assert.ok(['reserve','inspect','release'].includes(mode),'Key reservation mode differs');
 assert.ok(a&&Object.getPrototypeOf(a)===Object.prototype,'Plain key reservation approval required');assert.equal(a.profile,productionKeyReservationProfile,'Key reservation profile required');
 assert.equal(a.reservationWriteApproved,mode!=='inspect','Explicit reservation write approval differs');intent=validateKeyReservationIntent(intent);
 const read={...a};delete read.reservationWriteApproved;const base=buildProductionInspectionBootstrap('inspect-production-context',read),at=base.code.indexOf('echo json_encode(');assert.ok(at>0);
 const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64');
 const code=base.code.slice(0,at)+'$a=json_decode(base64_decode("'+encode(a)+'",true),true,32,JSON_THROW_ON_ERROR);$intent=json_decode(base64_decode("'+encode(intent)+'",true),true,16,JSON_THROW_ON_ERROR);echo json_encode(vne_adapter_production_key_reservation_dispatch("'+mode+'",$a,$intent),JSON_THROW_ON_ERROR);';
 assert.ok(!code.includes("'"),'Key reservation wrapper must remain literal');
 return {code,command:"eval '"+code+"' --user=1",scope:'production-key-reservation-metadata',privateWriteRequested:mode!=='inspect',applicationWriteRequested:false,keyWriteRequested:false,activationAuthorized:false,requiresSeparateHostingApproval:true,automationEnabled:false};
}
