"""Essai : voix Chatterbox (open source, MIT) en français, sur processeur (GitHub Actions), pour écouter avant de changer."""
import sys, time, subprocess, torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
TEXTES = ["Installe-toi confortablement. Tu n'as rien à réussir, juste être là, avec ce qui est.",
          "Inspire doucement par le nez… et laisse l'air ressortir, lentement, comme une vague qui se retire.",
          "Je suis là. On va y aller doucement, une chose à la fois."]
t0 = time.time(); m = ChatterboxMultilingualTTS.from_pretrained(device='cpu'); print(f'chargement {time.time()-t0:.0f} s', flush=True)
for nom, ref in [('feminine', 'ref_f.wav'), ('masculine', 'ref_m.wav')]:
    for i, t in enumerate(TEXTES):
        t1 = time.time()
        for essai in range(3):
            wav = m.generate(t, language_id='fr', audio_prompt_path=ref, exaggeration=0.35, cfg_weight=0.35, temperature=0.7)
            if wav.shape[-1] / m.sr > len(t) / 25: break
            print('phrase trop courte, nouvel essai', flush=True)
        f = f'essai/{nom}-{i+1}.wav'; ta.save(f, wav, m.sr)
        dur = wav.shape[-1] / m.sr
        print(f'{nom} {i+1} : {dur:.1f} s d’audio en {time.time()-t1:.0f} s', flush=True)
        subprocess.run(['ffmpeg', '-v', 'fatal', '-y', '-i', f, '-af', 'loudnorm=I=-19:TP=-2', '-ar', '24000', '-b:a', '64k', f.replace('.wav', '.mp3')], check=True)
