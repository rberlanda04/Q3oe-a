"""
Monta o vídeo vertical (1080x1920, para Reels, TikTok e Shorts) e um GIF a partir
das capturas de scripts/marketing/capturar-demo.mjs.

Uso: python scripts/marketing/montar-video.py PASTA_DAS_CAPTURAS PASTA_DE_SAIDA [NOME] [TITULO_DA_ABERTURA]
NOME padrão: q3orca-demo. Com TITULO, a abertura vira a chamada daquela profissão.
Requer Pillow e ffmpeg no PATH.
"""
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ENTRADA = Path(sys.argv[1])
SAIDA = Path(sys.argv[2])
SAIDA.mkdir(parents=True, exist_ok=True)
NOME = sys.argv[3] if len(sys.argv) > 3 else "q3orca-demo"
TITULO = sys.argv[4] if len(sys.argv) > 4 else "Orçamento rápido, aprovado pelo celular"

L, A, FPS = 1080, 1920, 30
TRANSICAO = 0.35
GRAFITE, GRAFITE_ESCURO, BRASA, AREIA = (27, 31, 42), (17, 20, 27), (255, 90, 31), (250, 246, 240)
FONTES = Path("C:/Windows/Fonts")
negrito = lambda t: ImageFont.truetype(str(FONTES / "segoeuib.ttf"), t)
normal = lambda t: ImageFont.truetype(str(FONTES / "segoeui.ttf"), t)


def texto_centro(d, y, texto, fonte, cor, largura_max=960):
    """Escreve centralizado, quebrando em linhas que caibam na largura."""
    palavras, linhas, atual = texto.split(), [], ""
    for p in palavras:
        teste = (atual + " " + p).strip()
        if d.textlength(teste, font=fonte) <= largura_max:
            atual = teste
        else:
            linhas.append(atual)
            atual = p
    linhas.append(atual)
    altura = fonte.size * 1.18
    for i, linha in enumerate(linhas):
        d.text(((L - d.textlength(linha, font=fonte)) / 2, y + i * altura), linha, font=fonte, fill=cor)
    return y + len(linhas) * altura


def fundo():
    img = Image.new("RGB", (L, A), GRAFITE_ESCURO)
    d = ImageDraw.Draw(img)
    for y in range(A):  # degradê vertical discreto
        t = y / A
        d.line([(0, y), (L, y)], fill=tuple(int(GRAFITE_ESCURO[i] + (GRAFITE[i] - GRAFITE_ESCURO[i]) * t) for i in range(3)))
    return img


def marca(d, y):
    f = negrito(46)
    texto = "Q3 Orça"
    w = d.textlength(texto, font=f)
    x = (L - w - 62) / 2
    d.rounded_rectangle([x, y, x + 50, y + 50], radius=13, fill=BRASA)
    d.text((x + 11, y - 4), "Q", font=negrito(40), fill="white")
    d.text((x + 62, y - 8), texto, font=f, fill="white")


def quadro_tela(captura, legenda, passo, total):
    img = fundo()
    d = ImageDraw.Draw(img)
    # Legenda no topo
    d.text((60, 70), f"{passo}/{total}", font=negrito(34), fill=BRASA)
    texto_centro(d, 130, legenda, negrito(72), "white")
    # Celular: captura com cantos arredondados, moldura e sombra
    tela = Image.open(captura).convert("RGB")
    alt = 1330
    larg = round(tela.width * alt / tela.height)
    tela = tela.resize((larg, alt), Image.LANCZOS)
    x, y = (L - larg) // 2, 430
    sombra = Image.new("L", (L, A), 0)
    ImageDraw.Draw(sombra).rounded_rectangle([x - 6, y + 24, x + larg + 6, y + alt + 40], radius=70, fill=170)
    img.paste((0, 0, 0), (0, 0), sombra.filter(ImageFilter.GaussianBlur(30)))
    d.rounded_rectangle([x - 16, y - 16, x + larg + 16, y + alt + 16], radius=68, fill=(8, 9, 12))
    mascara = Image.new("L", (larg, alt), 0)
    ImageDraw.Draw(mascara).rounded_rectangle([0, 0, larg, alt], radius=54, fill=255)
    img.paste(tela, (x, y), mascara)
    # Rodapé
    d.text(((L - d.textlength("www.q3orca.com.br", font=negrito(40))) / 2, A - 118), "www.q3orca.com.br", font=negrito(40), fill=AREIA)
    return img


def quadro_abertura():
    img = fundo()
    d = ImageDraw.Draw(img)
    marca(d, 560)
    y = texto_centro(d, 720, TITULO, negrito(96), "white", 900)
    texto_centro(d, y + 50, "Do orçamento ao Pix em 2 minutos. Grátis.", normal(52), (200, 205, 214), 900)
    return img


def quadro_final():
    img = fundo()
    d = ImageDraw.Draw(img)
    marca(d, 520)
    y = texto_centro(d, 680, "Faça seu primeiro orçamento grátis", negrito(96), "white", 900)
    f = negrito(56)
    w = d.textlength("www.q3orca.com.br", font=f) + 120
    d.rounded_rectangle([(L - w) / 2, y + 70, (L + w) / 2, y + 190], radius=60, fill=BRASA)
    d.text(((L - w) / 2 + 60, y + 95), "www.q3orca.com.br", font=f, fill="white")
    texto_centro(d, y + 260, "Modelos prontos para 26 profissões", normal(46), (200, 205, 214), 900)
    return img


legendas = json.loads((ENTRADA / "legendas.json").read_text(encoding="utf-8"))
quadros = [(quadro_abertura(), 2.6)]
for i, item in enumerate(legendas, 1):
    quadros.append((quadro_tela(ENTRADA / item["arquivo"], item["legenda"], i, len(legendas)), item["segundos"]))
quadros.append((quadro_final(), 3.2))
for i, (q, _) in enumerate(quadros):
    q.save(SAIDA / f"{NOME}-quadro-{i:02d}.png")

# Vídeo: cada quadro parado pelo tempo dele, com transição suave entre eles.
mp4 = SAIDA / f"{NOME}.mp4"
ff = subprocess.Popen(
    ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{L}x{A}", "-r", str(FPS), "-i", "-",
     "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(mp4)],
    stdin=subprocess.PIPE,
)
for i, (q, seg) in enumerate(quadros):
    for _ in range(int(seg * FPS)):
        ff.stdin.write(q.tobytes())
    if i + 1 < len(quadros):
        prox = quadros[i + 1][0]
        n = int(TRANSICAO * FPS)
        for k in range(1, n + 1):
            ff.stdin.write(Image.blend(q, prox, k / (n + 1)).tobytes())
ff.stdin.close()
ff.wait()

# GIF menor, para WhatsApp, e-mail e o site.
gif = SAIDA / f"{NOME}.gif"
filtro = "fps=10,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(mp4), "-vf", filtro, str(gif)], check=True)
print(f"{mp4} e {gif}")
