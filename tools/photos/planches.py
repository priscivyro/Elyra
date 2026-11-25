"""Planches de photos candidates (Picsum/Unsplash + Openverse CC0/PD/BY) pour choisir les images d'ELYRA.
Sortie : planches/*.jpg + planches/meta.json"""
import json, os, time, io, urllib.request, urllib.parse
from PIL import Image, ImageDraw
UA={'User-Agent':'ELYRA-perso/1.0 (appli personnelle)'}
def get(url,timeout=30):
    for k in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=timeout) as r:return r.read()
        except Exception as e:
            err=e;time.sleep(2+k*3)
    raise err
os.makedirs('planches',exist_ok=True)
W,H=200,140
def sheet(name,items):  # items: [(label, bytes)]
    cols=6;rows=(len(items)+cols-1)//cols
    im=Image.new('RGB',(cols*W,rows*(H+18)),'white');d=ImageDraw.Draw(im)
    for i,(lab,b) in enumerate(items):
        try:
            t=Image.open(io.BytesIO(b)).convert('RGB');t=t.resize((W,int(t.height*W/t.width)))
            if t.height<H:t=t.resize((int(t.width*H/t.height),H))
            x0=(t.width-W)//2;y0=(t.height-H)//2;t=t.crop((x0,y0,x0+W,y0+H))
        except Exception:continue
        x,y=(i%cols)*W,(i//cols)*(H+18);im.paste(t,(x,y));d.text((x+4,y+H+3),lab,fill='black')
    im.save(f'planches/{name}.jpg',quality=82)
meta={}
# 1) Picsum (photos Unsplash, licence Unsplash)
allp=[]
for page in range(1,15):
    try:L=json.loads(get(f'https://picsum.photos/v2/list?page={page}&limit=100'))
    except Exception as e:print('picsum',page,e);break
    if not L:break
    allp+=L
print('picsum',len(allp))
buf=[]
for i,p in enumerate(allp):
    lab='p'+p['id']
    meta[lab]={'src':'picsum','id':p['id'],'author':p['author'],'url':p['url'],'license':'Unsplash'}
    try:buf.append((lab,get(f"https://picsum.photos/id/{p['id']}/{W}/{H}")))
    except Exception as e:print('x',lab,e)
    if len(buf)==48:sheet(f'picsum_{i//48:02d}',buf);buf=[]
if buf:sheet(f'picsum_{len(allp)//48:02d}',buf)
# 2) Openverse (CC0, domaine public, CC BY)
Q=['candle flame dark','cup of tea steam','lighthouse sea night','hot air balloon sunrise','open book reading','zen stones balance','feather','singing bowl',
   'light through door','rowing boat lake','starry night sky','crescent moon','rain on window','misty mountains','sunrise meadow','ocean waves','forest path',
   'green leaf macro','clouds sky','winter beach','greenhouse plants','bread bakery','old library','japanese garden','lavender field','herbal tea chamomile','calm lake reflection','waterfall']
for qi,q in enumerate(Q):
    try:R=json.loads(get('https://api.openverse.org/v1/images/?'+urllib.parse.urlencode({'q':q,'license':'cc0,pdm,by','page_size':24,'mature':'false','aspect_ratio':'wide'})))['results']
    except Exception as e:print('openverse',q,e);time.sleep(5);continue
    buf=[]
    for j,r in enumerate(R):
        lab=f'o{qi:02d}{j:02d}'
        meta[lab]={'src':'openverse','q':q,'url':r.get('url'),'author':r.get('creator'),'license':(r.get('license') or '')+' '+(r.get('license_version') or ''),'landing':r.get('foreign_landing_url'),'title':r.get('title')}
        try:buf.append((lab,get(r.get('thumbnail') or r['url'])));time.sleep(.4)
        except Exception as e:print('x',lab,e)
    sheet(f'ov_{qi:02d}_'+q.replace(' ','-'),buf);time.sleep(3)
json.dump(meta,open('planches/meta.json','w'),ensure_ascii=False,indent=0)
print('ok',len(meta))
