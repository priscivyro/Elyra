"""Prépare une courte voix de référence (~12 s) à partir de la base SIWIS :
enregistrements d'une comédienne française professionnelle, diffusés librement par
l'Université d'Édimbourg (licence libre, à créditer). Ce n'est la voix de personne de l'entourage.
Seuls quelques fichiers sont lus dans l'archive (pas besoin de télécharger les 2,7 Go).
Usage : python tools/voix/reference_siwis.py <sortie.wav>"""
import io, os, subprocess, sys, wave
import numpy as np

URL = 'https://datashare.ed.ac.uk/bitstreams/64de089d-0ad5-45cb-a1c0-b6b39ecf6225/download'
out = sys.argv[1]


def ouvrir():
    from remotezip import RemoteZip
    try:
        return RemoteZip(URL)
    except Exception as e:  # serveur sans lecture partielle : téléchargement complet
        print('Lecture partielle impossible, téléchargement complet :', e, flush=True)
        subprocess.run(['curl', '-sSL', '--retry', '3', '-o', '/tmp/siwis.zip', URL], check=True)
        import zipfile
        return zipfile.ZipFile('/tmp/siwis.zip')


z = ouvrir()
noms = z.namelist()
wavs = sorted(n for n in noms if n.lower().endswith('.wav'))
print(len(wavs), 'enregistrements ; exemples :', wavs[:3], flush=True)
for n in noms:
    if os.path.basename(n).lower().startswith(('readme', 'licen', 'copying')):
        print('---', n, '---\n', z.read(n).decode('utf-8', 'replace')[:1500], flush=True)

# Préférence : lecture de romans (ton narratif), sinon n'importe quelle lecture neutre.
choix = [n for n in wavs if 'neut' in n.lower() and ('book' in n.lower() or 'livre' in n.lower())] \
     or [n for n in wavs if 'neut' in n.lower()] or wavs
SR = 24000
morceaux, total = [], 0.0
for n in choix[10:60]:
    raw = z.read(n)
    p = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'pipe:0', '-ac', '1', '-ar', str(SR), '-f', 's16le', 'pipe:1'],
                       input=raw, capture_output=True, check=True)
    a = np.frombuffer(p.stdout, dtype='<i2').astype(np.float32) / 32768
    idx = np.where(np.abs(a) > 0.01)[0]
    if idx.size == 0:
        continue
    a = a[max(0, idx[0] - 1200):idx[-1] + 2400]
    d = a.size / SR
    if d < 2 or d > 9:
        continue
    morceaux += [a, np.zeros(int(0.35 * SR), dtype=np.float32)]
    total += d
    print(f'  {n} ({d:.1f} s)', flush=True)
    if total >= 11:
        break

ref = np.concatenate(morceaux)
ref = ref / max(1e-6, np.abs(ref).max()) * 0.8
with wave.open(out, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((ref * 32767).astype('<i2').tobytes())
print(f'Voix de référence : {ref.size / SR:.1f} s → {out}')
