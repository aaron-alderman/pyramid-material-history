import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import {hash,read,root} from './build.mjs';
import {executeProcess} from '../vendor/sourcery/process/surface-async-process.mjs';
import {prepareUiSurfaceComposition,verifyUiSurfaceComposition} from '../vendor/sourcery/ui/surface-composition.mjs';
import {verifyNativeSurfaceCompositionLowering} from '../vendor/sourcery/ui/native-surface-composition-lowerer.mjs';
import {filterItems,pageItems,bindArguments,declarationFor} from '../vendor/sourcery/collection-model.mjs';
import {calculateWorkedCases} from './worked-calculations.mjs';
const site=path.join(root,'_site');
const built=p=>JSON.parse(fs.readFileSync(path.join(site,p),'utf8'));
const atlas=read('corpus/atlas.json'),profiles=read('data/programme-profiles.json');
test('retained implementations keep their exact source identities',()=>{
  for(const r of read('data/reuse-lock.json').sources)assert.equal(hash(fs.readFileSync(path.join(root,r.path))),r.retainedHash,r.path);
});
test('every decomposed corpus object preserves the twelve-coordinate kernel',()=>{
  const model=built('data/semantic-decomposition.json');assert.equal(model.objects.length,157);assert.equal(new Set(model.objects.map(x=>x.id)).size,model.objects.length);
  for(const o of model.objects)assert.deepEqual(Object.keys(o.kernel).sort(),[...profiles.kernel.coordinates].sort(),o.id);assert.equal(model.conjunctiveInputs,true);
});
test('joint inputs alternatives and the pyramid case remain distinct',()=>{
  const model=built('data/semantic-decomposition.json');for(const bridge of atlas.bridges){const projected=model.objects.find(x=>x.id===bridge.id);assert.deepEqual(projected.inputs,bridge.from);assert.equal(projected.output,bridge.to);assert.equal(projected.authority.empiricalAuthority,false);}
  assert.equal(atlas.workedCase.id,'pyramids-material-history');assert.equal(atlas.workedCase.subcases[0].id,'granite-alkali-history');assert.equal(new Set(atlas.operations.map(x=>x.exclusiveOutput)).size,9);
});
test('all native page compositions and lowerings replay through the retained mechanisms',()=>{
  const receipt=built('data/publication-receipt.json');assert.equal(receipt.uiEvidence.length,133);
  for(const r of receipt.uiEvidence){const p=built('data/ui/'+(r.route.replaceAll('/','-')||'home')+'.json');assert.equal(verifyUiSurfaceComposition(p.composition).passed,true,r.route);assert.equal(verifyNativeSurfaceCompositionLowering(p).passed,true,r.route);assert.equal(p.adoption.nativeEscapes.length,0);assert.equal(p.adoption.mappings.length,p.facts.filter(f=>f.p==='isa'&&f.o==='DomNode').length);}
});
test('renderer leakage and changed native realization fail closed',()=>{
  const p=built('data/ui/home.json'),bad=structuredClone(p.composition);bad.regions[0].css='display:none';assert.throws(()=>prepareUiSurfaceComposition(bad),/renderer configuration/);const drift=structuredClone(p);drift.realization.regions[0].label='Different source';assert.equal(verifyNativeSurfaceCompositionLowering(drift).passed,false);
});
test('existing collection grammar controls labels paths page sizes and action arguments',()=>{
  const definition={id:'arbitrary',source:{tool:'records',path:['objects']},title:'Unrelated records',filters:[{id:'q',kind:'search',label:'Source-owned label',path:['name'],operator:'contains-folded'}],pagination:{defaultSize:1,sizes:[1,2]},actions:[]};const rows=[{name:'Alpha',target:'a/'},{name:'Beta',target:'b/'}];
  assert.equal(filterItems(rows,definition,{q:'BETA'})[0].name,'Beta');assert.equal(pageItems(rows,definition,{},1,2).items.length,2);assert.throws(()=>pageItems(rows,definition,{},1,3),/not declared/);assert.deepEqual(bindArguments({href:{itemPath:['target']}},rows[1]),{href:'b/'});assert.equal(declarationFor({collections:[]},'records',['objects']),undefined);
});
test('the real composer retains dimensions and refuses historical authority inflation',async()=>{
  const process=read('data/scientific-derivation-process.json'),projection=built('data/record-composition.json');assert.equal(projection.positive.candidates.length,1);assert.equal(projection.historical.candidates.length,0);
  const graph=structuredClone(projection.graph);graph.transformations[0].dimensionDelta.time=1;const {result}=await executeProcess(process.program,{model:process,request:{graph,query:{source:'source-records',target:'published-reading',maxDepth:4}}},{compute:{},ports:{}});assert.equal(result.candidates.length,0);
  const missing=structuredClone(projection.graph);delete missing.transformations[0].dimensionRule;const response=await executeProcess(process.program,{model:process,request:{graph:missing,query:{source:'source-records',target:'published-reading',maxDepth:4}}},{compute:{},ports:{}});assert.equal(response.result.candidates.length,0);
});
test('every generated page has a current hash and its local links resolve under a project path',()=>{
  const pages=built('data/pages.json');let links=0;for(const p of pages){const file=path.join(site,p.route,'index.html'),html=fs.readFileSync(file,'utf8');assert.equal(hash(html),p.sourceHash,p.route);assert.ok(html.includes('type="importmap"'));assert.ok(!html.includes('C:/Users/'));
    for(const match of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)){const value=match[1];if(/^(https?:|data:|mailto:)/.test(value))continue;const target=path.resolve(path.dirname(file),decodeURIComponent(value));assert.ok(target.startsWith(site+path.sep)||target===site,'path escape '+value);assert.ok(fs.existsSync(target),p.route+' → '+value);links++;}}
  assert.ok(links>1000);
});
test('the full article retains the pyramid case and renders mathematics',()=>{
  const html=fs.readFileSync(path.join(site,'read/index.html'),'utf8');assert.ok(html.includes('The pyramids are the canonical example'));assert.ok(html.includes('katex-display'));assert.ok(html.includes('Granite and alkali treatment within the pyramid case'));assert.ok(html.includes('North Face Corridor'));
});
test('publication carries no new runtime lane or empirical admission claim',()=>{
  const receipt=built('data/publication-receipt.json');assert.equal(receipt.recordComposition.historicalPromotionCandidates,0);assert.equal(receipt.recordComposition.authorityCeiling,'proposal-only; non-entailing; no empirical authority');assert.ok(receipt.boundaries.includes('No new Sourcery lane, registry, scheduler or interpreter.'));
});
test('worked investigations retain atomic outputs conjunctive inputs and resolved evidence',()=>{
  const work=read('corpus/worked-investigations.json'),objects=built('data/semantic-decomposition.json').objects,ids=new Set(objects.map(o=>o.id));
  assert.equal(work.studies.length,4);assert.equal(work.studies.flatMap(s=>s.steps).length,25);
  for(const s of work.studies)for(const step of s.steps){assert.ok(atlas.operations.some(o=>o.id===step.operation));assert.ok(step.output);assert.ok(step.paragraphs.every(p=>p.trim().length>0));assert.deepEqual(objects.find(o=>o.id===step.id).inputs,step.inputs);for(const id of [...step.inputs,...step.evidenceRefs])assert.ok(ids.has(id),step.id+' unresolved '+id);}
  assert.equal(work.studies[2].steps.find(s=>s.matrix).matrix.length,5);
  for(const s of work.studies){const html=fs.readFileSync(path.join(site,'studies',s.id,'index.html'),'utf8');for(const step of s.steps)assert.ok(html.includes('id="'+step.id+'"'));assert.ok(!html.includes('Not supplied'));}
  assert.deepEqual(built('data/publication-receipt.json').workedInvestigations,{studies:4,steps:25,calculations:10,experimentPerformed:false,monumentSampled:false,historicalAttribution:false});
});
test('worked arithmetic conserves formula mass and exposes rate and detection assumptions',()=>{
  const input=read('corpus/calculation-inputs.json'),output=calculateWorkedCases(input),c=id=>output.calculations.find(c=>c.id===id);
  assert.equal(c('C02').rows[0][1],0.001);assert.equal(c('C02').rows[1][1],2.65);
  assert.ok(c('C01').rows[0][1]>1.763&&c('C01').rows[0][1]<1.765);
  // Independent product-side formula accounting for the carbonate balance.
  const metasilicateMass=2*22.98976928+28.0855+3*15.9994;
  assert.ok(Math.abs(60.0843+105.9884-metasilicateMass-44.0095)<0.001);
  for(const row of c('C03').rows)assert.ok(Math.abs(row[1]*row[2]-1000)<1e-8);
  assert.ok(c('C04').rows[1][1]>134&&c('C04').rows[1][1]<136);
  const sameT=structuredClone(input);sameT.temperaturesK.high=sameT.temperaturesK.low;assert.equal(calculateWorkedCases(sameT).calculations.find(c=>c.id==='C04').rows[1][1],1);
  const impossible=structuredClone(input);impossible.detectionScenarios[0].survivalGivenFormation=0;assert.equal(calculateWorkedCases(impossible).calculations.find(c=>c.id==='C05').rows[0][2],1);
  assert.equal(c('C06').rows[1][1],0);assert.ok(c('C06').rows[0][1]>0.64&&c('C06').rows[0][1]<0.65);
  assert.deepEqual(built('data/worked-calculations.json'),output);
});
test('retained composer checks real quantity dimensions and rejects a corrupted molar-volume map',async()=>{
  const report=built('data/worked-quantity-composition.json'),process=read('data/scientific-derivation-process.json');assert.equal(report.results.length,2);for(const result of report.results)assert.equal(result.candidates.length,1);
  const graph=structuredClone(report.graph);graph.transformations[1].dimensionDelta.amount=0;
  const response=await executeProcess(process.program,{model:process,request:{graph,query:{source:'quartz-molar-flux',target:'quartz-recession-speed',maxDepth:1}}},{compute:{},ports:{}});assert.equal(response.result.candidates.length,0);
});
test('factorial demonstration separates conditional effects and rejects missing or aliased cells',()=>{
  const p=read('corpus/calculation-inputs.json'),calcs=calculateWorkedCases(p).calculations,f=calcs.find(c=>c.id==='C07');
  assert.deepEqual(f.rows.map(r=>r[1]),[1,7,4,7,6,11]);assert.ok(f.scope.includes('SYNTHETIC'));
  const additive=structuredClone(p);additive.variation.factorialCells.find(c=>c.heat===1&&c.alkali===1).responseMg=6;assert.equal(calculateWorkedCases(additive).calculations.find(c=>c.id==='C07').rows[4][1],0);
  const reordered=structuredClone(p);reordered.variation.factorialCells.reverse();assert.deepEqual(calculateWorkedCases(reordered).calculations.find(c=>c.id==='C07').rows,f.rows);
  const missing=structuredClone(p);missing.variation.factorialCells.pop();assert.throws(()=>calculateWorkedCases(missing),/complete/);
  const alias=structuredClone(p);alias.variation.factorialCells[1]=alias.variation.factorialCells[0];assert.throws(()=>calculateWorkedCases(alias),/complete/);
});
test('sensitivity invariance and bottleneck transfer keep different time metrics distinct',()=>{
  const p=read('corpus/calculation-inputs.json'),calcs=calculateWorkedCases(p).calculations,grid=calcs.find(c=>c.id==='C08').rows,pipe=calcs.find(c=>c.id==='C09').rows;
  const equalScale=grid.filter(r=>r[0]===r[1]);for(const r of equalScale)assert.ok(Math.abs(r[2]-equalScale[0][2])<1e-10);
  assert.deepEqual(pipe.map(r=>r.slice(2)),[[8,17,89],[4,13,49],[4,11,47]]);assert.equal(pipe[2][1],'Inspection/release');
  const single=structuredClone(p);single.variation.pipeline.batchSize=1;for(const r of calculateWorkedCases(single).calculations.find(c=>c.id==='C09').rows)assert.equal(r[3],r[4]);
  const bad=structuredClone(p);bad.variation.sensitivityMultipliers[0]=0;assert.throws(()=>calculateWorkedCases(bad),/positive/);
  const housing=calcs.find(c=>c.id==='C10');assert.ok(Math.abs(housing.rows[1][1]-11385)<1e-8);assert.ok(housing.rows[1][2]>2.13&&housing.rows[1][2]<2.15);
});
