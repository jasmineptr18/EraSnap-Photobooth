"""Offline validation of importable n8n workflow graphs and file layout."""
import json,pathlib,sys
root=pathlib.Path(__file__).resolve().parent.parent
errors=[]
for p in sorted((root/'n8n').glob('*.json')):
    wf=json.loads(p.read_text(encoding='utf-8'))
    assert wf['active'] is False
    names=[n['name'] for n in wf['nodes']]
    if len(names)!=len(set(names)):errors.append(f'{p.name}: duplicate node names')
    for src,conf in wf['connections'].items():
        if src not in names:errors.append(f'{p.name}: unknown source {src}')
        for branch in conf.get('main',[]):
            for dest in branch:
                if dest['node'] not in names:errors.append(f'{p.name}: unknown dest {dest["node"]}')
    print(f'{p.name}: {len(names)} nodes, {len(wf["connections"])} connected sources, valid JSON')
for relative in ['README.md','BUSINESS_PLAN.md','api/src/index.js','web/src/main.jsx','web/src/style.css','finance/model_keuangan_era_snap.xlsx','Dockerfile','docker-compose.yml','docs/SETUP_INTEGRATIONS.md']:
    if not (root/relative).exists():errors.append('missing '+relative)
if errors:
    print('\n'.join(errors));sys.exit(1)
print('OK: structure checks passed')
