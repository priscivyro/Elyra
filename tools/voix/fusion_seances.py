"""Voix féminine des séances = voix C (Chatterbox) quand la phrase existe, sinon voix Piper.
Usage : python tools/voix/fusion_seances.py <piper_dir> <voix_c_dir> <sortie_dir>"""
import json, os, shutil, sys

piper_dir, c_dir, out = sys.argv[1:4]
P = json.load(open(os.path.join(piper_dir, 'index.json'), encoding='utf-8'))
try:
    Cx = json.load(open(os.path.join(c_dir, 'index.json'), encoding='utf-8')).get('items', {})
except Exception:
    Cx = {}
shutil.rmtree(out, ignore_errors=True)
os.makedirs(out)
items, nc = {}, 0
for t, (f, d) in P['items'].items():
    src = os.path.join(piper_dir, f)
    if t in Cx and os.path.exists(os.path.join(c_dir, Cx[t][0])):
        f, d = Cx[t]
        src = os.path.join(c_dir, f)
        nc += 1
    shutil.copy(src, os.path.join(out, f))
    items[t] = [f, d]
json.dump({'v': 2, 'voice': P.get('voice'), 'engine': 'chatterbox' if nc else 'piper', 'c': nc, 'items': items},
          open(os.path.join(out, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print(f'Séances (voix féminine) : {nc} phrases en voix C, {len(items) - nc} en voix Piper')
