import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import {hash,read,root} from './build.mjs';
import {executeProcess} from '../vendor/sourcery/process/surface-async-process.mjs';
import {prepareUiSurfaceComposition,verifyUiSurfaceComposition} from '../vendor/sourcery/ui/surface-composition.mjs';
import {verifyNativeSurfaceCompositionLowering} from '../vendor/sourcery/ui/native-surface-composition-lowerer.mjs';
import {filterItems,pageItems,bindArguments,declarationFor} from '../vendor/sourcery/collection-model.mjs';
const site=path.join(root,'_site');
const built=p=>JSON.parse(fs.readFileSync(path.join(site,p),'utf8'));
const atlas=read('corpus/atlas.json'),profiles=read('data/programme-profiles.json');
test('retained implementations keep their exact source identities',()=>{
  for(const r of read('data/reuse-lock.json').sources)assert.equal(hash(fs.readFileSync(path.join(root,r.path))),r.retainedHash,r.path);
});
test('every decomposed corpus object preserves the twelve-coordinate kernel',()=>{
  const model=built('data/semantic-decomposition.json');assert.equal(model.objects.length,108);assert.equal(new Set(model.objects.map(x=>x.id)).size,model.objects.length);
  for(const o of model.objects)assert.deepEqual(Object.keys(o.kernel).sort(),[...profiles.kernel.coordinates].sort(),o.id);assert.equal(model.conjunctiveInputs,true);
});
test('joint inputs alternatives and the pyramid case remain distinct',()=>{
  const model=built('data/semantic-decomposition.json');for(const bridge of atlas.bridges){const projected=model.objects.find(x=>x.id===bridge.id);assert.deepEqual(projected.inputs,bridge.from);assert.equal(projected.output,bridge.to);assert.equal(projected.authority.empiricalAuthority,false);}
  assert.equal(atlas.workedCase.id,'pyramids-material-history');assert.equal(atlas.workedCase.subcases[0].id,'granite-alkali-history');assert.equal(new Set(atlas.operations.map(x=>x.exclusiveOutput)).size,9);
});
test('all native page compositions and lowerings replay through the retained mechanisms',()=>{
  const receipt=built('data/publication-receipt.json');assert.equal(receipt.uiEvidence.length,118);
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
