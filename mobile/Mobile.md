# Mobile

## Iconos

Ejecutar estos comandos para generar los tamaños necesarios con fondo `#0a0e0f`:

```bash
convert milogo.png -resize 512x512 -background "#0a0e0f" -flatten icon-512x512.png
convert milogo.png -resize 192x192 -background "#0a0e0f" -flatten icon-192x192.png
```

Subir los iconos a la web para que sean accesibles en:
- `https://mydomain.net/icons/icon-192x192.png`
- `https://mydomain.net/icons/icon-512x512.png`

## Generar APK

### Si ya tienes el proyecto generado

Solo necesitas recompilar:

```bash
bubblewrap build
```

Te pedirá las contraseñas del keystore. El APK resultante estará en `~/apk/app-release-signed.apk`.

### Si necesitas regenerar el proyecto desde cero

```bash
mkdir ~/apk && cd ~/apk
bubblewrap init --manifest https://mydomain.net/manifest.json
```

Valores que usar durante el wizard:

| Campo                      | Valor                                       |
|----------------------------|---------------------------------------------|
| Domain                     | mydomain.net                                |
| URL path                   | /                                           |
| Application name           | Project AI                                  |
| Short name                 | Project AI                                  |
| Application ID             | net.mydomain.projectai                      |
| Display mode               | standalone                                  |
| Orientation                | portrait                                    |
| Status bar color           | #00FF9D                                   |
| Splash screen color        | #0A0E0F                                   |
| Icon URL                   | https://mydomain.net/icons/icon-512x512.png |
| Maskable / Monochrome      | dejar vacío                                 |
| Play Billing / Geolocation | No                                          |
| Key store location         | /home/kobay/apk/android.keystore            |
| Key name                   | android                                     |
|

Una vez generado el proyecto, compilar:

```bash
bubblewrap build
```

## Notas

- La contraseña del keystore es necesaria en cada compilación.
- El keystore `android.keystore` es el certificado de firma de la app. **No lo pierdas ni lo borres** — si cambias de keystore, Android tratará el nuevo APK como una app diferente y no actualizará la instalación existente.
- Si cambias iconos o el manifest en la web, con solo ejecutar `bubblewrap build` en `~/apk` es suficiente, no hace falta volver a hacer `init`.
