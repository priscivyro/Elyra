"""Rythme commun des voix ELYRA : découpe en phrases et pauses naturelles entre elles.
Utilisé par render.py (Piper) et essai_chatterbox.py (Chatterbox)."""
import re
import numpy as np

# Pause (en secondes) laissée après chaque fin de phrase, selon la ponctuation.
PAUSES = {'…': 0.95, '.': 0.7, '!': 0.6, '?': 0.75, ':': 0.45, ';': 0.45}


def phrases(text):
    """Découpe le texte en phrases (après . ! ? … : ;) en gardant la ponctuation.
    Les points de suspension coupent aussi au milieu d'une phrase : « doucement… et »."""
    text = re.sub(r'\.\.\.', '…', text.strip())
    parts = re.split(r'(?<=[.!?…;:])\s+', text)
    out = []
    for p in parts:
        p = p.strip()
        if not p:
            continue
        # Un morceau trop court (« Bien. ») est collé au suivant pour garder une intonation naturelle.
        if out and len(out[-1]) < 12 and out[-1][-1] not in '…':
            out[-1] += ' ' + p
        else:
            out.append(p)
    return out or [text]


def pause_apres(p, dernier):
    if dernier:
        return 0.0
    return PAUSES.get(p.rstrip()[-1], 0.35)


def rogne(a, sr, seuil=0.012, marge=0.04):
    """Retire le silence au début et à la fin d'un morceau (float32 entre -1 et 1)."""
    if a.size == 0:
        return a
    idx = np.where(np.abs(a) > seuil)[0]
    if idx.size == 0:
        return a[:0]
    m = int(marge * sr)
    return a[max(0, idx[0] - m):min(a.size, idx[-1] + m)]


def fondu(a, sr, ms=12):
    n = min(a.size // 2, int(sr * ms / 1000))
    if n > 0:
        a = a.copy()
        a[:n] *= np.linspace(0, 1, n)
        a[-n:] *= np.linspace(1, 0, n)
    return a


def assemble(morceaux, sr):
    """morceaux : liste de (audio float32, pause après en s). Renvoie un seul tableau."""
    out = []
    for a, pause in morceaux:
        out.append(fondu(rogne(a, sr), sr))
        if pause > 0:
            out.append(np.zeros(int(pause * sr), dtype=np.float32))
    return np.concatenate(out) if out else np.zeros(1, dtype=np.float32)


# Voix plus chaude et proche : graves doux, aigus adoucis, petite pièce feutrée, volume homogène.
FILTRE = ('highpass=f=70,equalizer=f=200:t=q:w=1:g=2.5,equalizer=f=3200:t=q:w=1.5:g=-1.5,'
          'treble=g=-2.5:f=7000,lowpass=f=9500,'
          'aecho=0.9:0.88:38|67:0.10|0.06,'
          'loudnorm=I=-19:TP=-2:LRA=7,aresample=24000,adelay=250,apad=pad_dur=0.4')
