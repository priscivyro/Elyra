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
