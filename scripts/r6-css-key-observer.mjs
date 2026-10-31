// Generates a read-only, package-pinned CLI command. Never executes or transports a key.
import assert from 'node:assert/strict';
import {buildProductionInspectionBootstrap} from './r6-css-operator.mjs';
import {validateKeyHandshakeRequest} from './r6-css-key-handshake.mjs';
import {productionKeyObservationProfile} from './release-r6-css-adapter.mjs';

export function buildProductionKeyObservationBootstrap(approval,request,...extra){
 assert.equal(extra.length,0,'Key observation overrides refused');
 assert.equal(approval?.profile,productionKeyObservationProfile,'Candidate observation profile required');
 validateKeyHandshakeRequest(request);
 const base=buildProductionInspectionBootstrap('inspect-production-context',approval);
 const at=base.code.indexOf('echo json_encode(');assert.ok(at>0);
 const code=base.code.slice(0,at)+'$request=json_decode(base64_decode("'+Buffer.from(JSON.stringify(request)).toString('base64')+'",true),true,16,JSON_THROW_ON_ERROR);echo json_encode(vne_adapter_production_key_observation_dispatch($a,$request),JSON_THROW_ON_ERROR);';
 assert.ok(!code.includes("'"),'Candidate observation wrapper must remain literal');
 return {code,command:"eval '"+code+"' --user=1",scope:'production-read-only-key-candidate-observation',loadsWordPressBeforeCommand:true,applicationWriteRequested:false,privateWriteRequested:false,createsKeys:false,activationAuthorized:false,requiresSeparateHostingApproval:true,automationEnabled:false};
}
