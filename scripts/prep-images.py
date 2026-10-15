# Lee una lista de {key,file,crop?,w} por stdin y escribe {key: data URI JPEG} por stdout.
import sys, json, base64, io
from PIL import Image
spec = json.load(sys.stdin)
out = {}
for s in spec:
    im = Image.open(s['file']).convert('RGBA')
    if s.get('crop'):
        im = im.crop(tuple(s['crop']))
    bg = Image.new('RGB', im.size, (14, 26, 70))
    bg.paste(im, mask=im.split()[3])
    w = s.get('w', 360)
    h = round(bg.height * w / bg.width)
    bg = bg.resize((w, h), Image.LANCZOS)
    buf = io.BytesIO()
    bg.save(buf, 'JPEG', quality=s.get('q', 70), optimize=True, progressive=True)
    out[s['key']] = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
json.dump(out, sys.stdout)
