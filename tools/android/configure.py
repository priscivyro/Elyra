"""Configure le projet Android généré par Capacitor :
- signature TOUJOURS identique (clé signing/debug.keystore), pour que les mises à jour s'installent par-dessus ;
- numéro de version qui augmente à chaque construction.
Usage : python tools/android/configure.py <versionCode> <versionName>"""
import re, sys, pathlib
code, name = sys.argv[1], sys.argv[2]
p = pathlib.Path('android/app/build.gradle')
s = p.read_text()
ks = (pathlib.Path('signing/debug.keystore').resolve()).as_posix()
s = re.sub(r'versionCode \d+', f'versionCode {int(code)}', s, count=1)
s = re.sub(r'versionName "[^"]*"', f'versionName "{name}"', s, count=1)
sign = f'''    signingConfigs {{
        elyra {{
            storeFile file("{ks}")
            storePassword "android"
            keyAlias "androiddebugkey"
            keyPassword "android"
        }}
    }}
    buildTypes {{
        debug {{
            signingConfig signingConfigs.elyra
        }}'''
assert '    buildTypes {' in s, 'bloc buildTypes introuvable'
s = s.replace('    buildTypes {', sign, 1)
p.write_text(s)
print('build.gradle configuré :', code, name)

# Petite icône des rappels (notification) : le bourgeon ELYRA, en silhouette blanche.
d = pathlib.Path('android/app/src/main/res/drawable'); d.mkdir(parents=True, exist_ok=True)
(d / 'ic_stat_elyra.xml').write_text('''<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24">
  <path android:fillColor="#FFFFFFFF" android:fillType="evenOdd" android:pathData="M12,2C15.8,6.1 20.2,10.5 20.2,15A8.2,7.9 0,0 1,3.8,15C3.8,10.5 8.2,6.1 12,2ZM9,11.5L14.6,11.5L14.6,12.9L10.4,12.9L10.4,14.1L13.2,14.1L13.2,15.4L10.4,15.4L10.4,16.6L14.6,16.6L14.6,18L9,18Z"/>
</vector>''')
print('icône de notification ajoutée')

# Micro pour la conversation à voix haute (la permission est demandée à la première utilisation).
m = pathlib.Path('android/app/src/main/AndroidManifest.xml')
x = m.read_text()
for perm in ('android.permission.RECORD_AUDIO', 'android.permission.MODIFY_AUDIO_SETTINGS'):
    if perm not in x:
        x = x.replace('</manifest>', f'    <uses-permission android:name="{perm}" />\n</manifest>', 1)
m.write_text(x)
print('permissions micro ajoutées')

# Raccourcis sur l'icône (appui long) : SOS et Respirer. Ouvrent elyra://sos et elyra://respirer.
import json
app_id = json.load(open('capacitor.config.json'))['appId']
xd = pathlib.Path('android/app/src/main/res/xml'); xd.mkdir(parents=True, exist_ok=True)
def sc(i, lab, icon):
    return f'''  <shortcut android:shortcutId="{i}" android:enabled="true" android:icon="@mipmap/ic_launcher" android:shortcutShortLabel="@string/sc_{i}" android:shortcutLongLabel="@string/sc_{i}">
    <intent android:action="android.intent.action.VIEW" android:targetPackage="{app_id}" android:targetClass="{app_id}.MainActivity" android:data="elyra://{i}" />
  </shortcut>'''
(xd / 'shortcuts.xml').write_text('<?xml version="1.0" encoding="utf-8"?>\n<shortcuts xmlns:android="http://schemas.android.com/apk/res/android">\n' + sc('sos', 'SOS', '') + '\n' + sc('respirer', 'Respirer', '') + '\n</shortcuts>\n')
sv = pathlib.Path('android/app/src/main/res/values/strings.xml'); t = sv.read_text()
for k, v in (('sc_sos', 'SOS anxiété'), ('sc_respirer', 'Respirer')):
    if k not in t: t = t.replace('</resources>', f'    <string name="{k}">{v}</string>\n</resources>', 1)
sv.write_text(t)
x = m.read_text()
if 'android.app.shortcuts' not in x:
    x = re.sub(r'(<activity[^>]*MainActivity[^>]*>)', r'''\1
            <meta-data android:name="android.app.shortcuts" android:resource="@xml/shortcuts" />
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="elyra" />
            </intent-filter>''', x, count=1, flags=re.S)
    assert 'android.app.shortcuts' in x, 'activité principale introuvable'
m.write_text(x)
print('raccourcis SOS et Respirer ajoutés')
