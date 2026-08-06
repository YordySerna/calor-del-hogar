# ============================================================
#  HOJALATERÍA CALOR DE HOGAR — preparar videos para la web
#
#  Toma los clips del teléfono (4K, HEVC, 60 fps, ~60 Mbps) y saca
#  de cada uno dos archivos:
#    · un .mp4 de 720p listo para el sitio (~30x más liviano)
#    · un .jpg del primer fotograma, que hace de poster
#
#  El poster importa más de lo que parece: es lo que se ve mientras
#  el video no se ha tocado. Con preload="none" el .mp4 NO se
#  descarga hasta que alguien le da play, así que quien solo pasa
#  scrolleando no paga un solo KB de video.
#
#  Se recodifica a H.264 y no se deja el HEVC original porque HEVC
#  no lo reproducen todos los navegadores.
#
#  Uso:  powershell -ExecutionPolicy Bypass -File optimizar-media.ps1
# ============================================================

param(
  [string]$Origen  = "$PSScriptRoot\images\originales",
  [string]$Destino = "$PSScriptRoot\images",
  [int]$Calidad    = 28,      # CRF de x264: más alto = más liviano y con menos detalle
  [int]$Alto       = 720
)

# ffmpeg lo instala winget fuera del PATH del shell actual, así que se busca.
$ffmpeg  = (Get-Command ffmpeg  -ErrorAction SilentlyContinue).Source
if (-not $ffmpeg) {
  $ffmpeg = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter ffmpeg.exe -ErrorAction SilentlyContinue |
            Select-Object -First 1 -ExpandProperty FullName
}
if (-not $ffmpeg) { Write-Error "No se encontró ffmpeg. Instalar con: winget install Gyan.FFmpeg"; exit 1 }

# Qué clip es cuál. Los nombres siguen la convención de las fotos
# (taller-*, local-*) para que se ordenen juntos en la carpeta.
#   segundo = de dónde se saca el poster
$clips = @(
  @{ src = "VID_20260805_102540.mp4"; out = "taller-maestro";      segundo = 4.0 },
  @{ src = "VID_20260805_102434.mp4"; out = "taller-banco";        segundo = 2.0 },
  @{ src = "VID_20260805_102347.mp4"; out = "taller-plantillas";   segundo = 5.0 },
  @{ src = "VID_20260805_102500.mp4"; out = "taller-general";      segundo = 2.0 },
  @{ src = "VID_20260805_102517.mp4"; out = "taller-meson";        segundo = 4.0 },
  @{ src = "VID_20260805_102958.mp4"; out = "local-estanterias";   segundo = 4.0 },
  @{ src = "VID_20260805_102732.mp4"; out = "local-patio";         segundo = 4.0 },
  @{ src = "VID_20260805_102812.mp4"; out = "local-entrada-video"; segundo = 3.0 }
)

Write-Host "ffmpeg: $ffmpeg`n"

foreach ($c in $clips) {
  $entrada = Join-Path $Origen $c.src
  if (-not (Test-Path $entrada)) { Write-Host "  falta $($c.src), se salta"; continue }

  $salidaMp4 = Join-Path $Destino "$($c.out).mp4"
  $salidaJpg = Join-Path $Destino "$($c.out)-poster.jpg"

  Write-Host "-> $($c.out)"

  # VIDEO
  #   scale   : baja a 720 de alto manteniendo proporción; -2 deja el ancho par
  #   fps=30  : la mitad de los 60 originales. No se nota y pesa bastante menos
  #   crf     : calidad; 28 es buen punto para material de taller
  #   -an     : sin audio. Son loops mudos; el audio del teléfono no aporta nada
  #   faststart: mueve el índice al principio para que empiece antes de bajar todo
  & $ffmpeg -y -loglevel error -i $entrada `
      -vf "scale=-2:$Alto,fps=30" `
      -c:v libx264 -preset slow -crf $Calidad -pix_fmt yuv420p `
      -an -movflags +faststart `
      $salidaMp4

  # POSTER
  & $ffmpeg -y -loglevel error -ss $c.segundo -i $entrada `
      -frames:v 1 -vf "scale=-2:$Alto" -q:v 4 `
      $salidaJpg

  if (Test-Path $salidaMp4) {
    $antes   = (Get-Item $entrada).Length / 1MB
    $despues = (Get-Item $salidaMp4).Length / 1MB
    "   {0,6:N1} MB -> {1,5:N2} MB   ({2,4:N0}x mas liviano)" -f $antes, $despues, ($antes / $despues)
  }
}

$total = (Get-ChildItem "$Destino\*.mp4" | Measure-Object -Property Length -Sum).Sum / 1MB
"`nTotal de video en images/: {0:N1} MB" -f $total
