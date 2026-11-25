"""Enregistre les séances avec une voix humaine Microsoft (Azure Speech, offre gratuite F0 : 500 000 caractères/mois).
Usage : AZURE_SPEECH_KEY=… AZURE_SPEECH_REGION=… python tools/voix/azure.py <lignes.json> <dossier_sortie> <voix> [voix_secours]
Seules les nouvelles phrases sont envoyées. L'offre gratuite accepte environ 20 demandes par minute : on avance doucement."""
import hashlib, json, os, subprocess, sys, tempfile, time, urllib.request, urllib.error
lines_path, out_dir, voice = sys.argv[1], sys.argv[2], sys.argv[3]
backup = sys.argv[4] if len(sys.argv) > 4 else None
key = os.environ['AZURE_SPEECH_KEY'].strip()
region = ''.join(os.environ.get('AZURE_SPEECH_REGION', 'westeurope').split()).lower()
url = f'https://{region}.tts.speech.microsoft.com/cognitiveservices/v1'
os.makedirs(out_dir, exist_ok=True)
lines = json.load(open(lines_path, encoding='utf-8'))

def name(text): return hashlib.sha1(('v1|' + text).encode('utf-8')).hexdigest()[:14] + '.mp3'
def xml(t): return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace("'", '&apos;').replace('"', '&quot;')
def duration(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', path], capture_output=True, text=True)
    return round(float(r.stdout.strip() or 0), 2)
def synth(text, v):
    body = f"<speak version='1.0' xml:lang='fr-FR' xmlns='http://www.w3.org/2001/10/synthesis'><voice name='{v}'><prosody rate='-8%'>{xml(text)}</prosody></voice></speak>".encode('utf-8')
    req = urllib.request.Request(url, data=body, method='POST', headers={'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3', 'User-Agent': 'ELYRA'})
    with urllib.request.urlopen(req, timeout=60) as r: return r.read()

items, made, failed = {}, 0, 0
for text in lines:
    f = name(text); dst = os.path.join(out_dir, f)
    if not os.path.exists(dst):
        data = None
        for attempt in range(6):
            try:
                data = synth(text, voice); break
            except urllib.error.HTTPError as e:
                if e.code == 400 and backup and voice != backup:
                    print(f'Voix {voice} indisponible ici : {backup} à la place'); voice = backup; continue
                if e.code in (401, 403): sys.exit(f'Clé Azure refusée ({e.code}) : vérifie AZURE_SPEECH_KEY et AZURE_SPEECH_REGION.')
                wait = int(e.headers.get('Retry-After') or 0) or 10 * (attempt + 1)
                print(f'Azure {e.code}, nouvel essai dans {wait} s'); time.sleep(wait)
            except Exception as e:
                print('Erreur réseau', e); time.sleep(5)
        time.sleep(3.2)
        if not data: failed += 1; continue
        with tempfile.TemporaryDirectory() as td:
            raw = os.path.join(td, 'a.mp3'); open(raw, 'wb').write(data)
            subprocess.run(['ffmpeg', '-v', 'fatal', '-y', '-i', raw, '-af', 'loudnorm=I=-19:TP=-2:LRA=7,aresample=24000,adelay=250,apad=pad_dur=0.4',
                            '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', '56k', dst], check=True)
        made += 1
    items[text] = [f, duration(dst)]

keep = {v[0] for v in items.values()}
for f in os.listdir(out_dir):
    if f.endswith('.mp3') and f not in keep: os.remove(os.path.join(out_dir, f))
json.dump({'v': 1, 'voice': voice, 'complete': failed == 0 and len(items) == len(lines), 'items': items},
          open(os.path.join(out_dir, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print(f'{len(items)}/{len(lines)} phrases, {made} nouvelles, {failed} en échec')
