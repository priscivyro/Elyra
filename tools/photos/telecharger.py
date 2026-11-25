"""Télécharge les photos choisies (collection Picsum = photos Unsplash, licence Unsplash) dans www/photos/."""
import json, os, io, time, urllib.request
from PIL import Image
UA={'User-Agent':'ELYRA-perso/1.0'}
def get(u):
    for k in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=60) as r:return r.read()
        except Exception as e:err=e;time.sleep(3+k*4)
    raise err
choix=json.load(open('tools/photos/choix.json'))
os.makedirs('www/photos',exist_ok=True)
info={};cache={}
for key,pid in choix.items():
    pid=str(pid)
    if pid not in info:info[pid]=json.loads(get(f'https://picsum.photos/id/{pid}/info'))
    if pid not in cache:
        im=Image.open(io.BytesIO(get(f'https://picsum.photos/id/{pid}/720/720'))).convert('RGB')
        b=io.BytesIO();im.save(b,'WEBP',quality=72,method=6);cache[pid]=b.getvalue()
    open(f'www/photos/{key}.webp','wb').write(cache[pid])
    print(key,pid,len(cache[pid]))
cred={}
for pid,i in info.items():cred[i['author']]=i.get('url','')
js='window.ELYRA_PHOTOS='+json.dumps({'keys':sorted(choix),'credits':[[a,u] for a,u in sorted(cred.items())]},ensure_ascii=False)+';\n'
open('www/photos/index.js','w').write(js)
