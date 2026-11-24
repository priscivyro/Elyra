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
  <path android:fillColor="#FFFFFFFF" android:pathData="M12,3C10.2,5 9.3,7.6 9.4,10.4C7.6,9 5.4,8.5 3.5,8.8C3.7,13.6 6.9,17.3 11,18.2L11,21L13,21L13,18.2C17.1,17.3 20.3,13.6 20.5,8.8C18.6,8.5 16.4,9 14.6,10.4C14.7,7.6 13.8,5 12,3Z"/>
</vector>''')
print('icône de notification ajoutée')
