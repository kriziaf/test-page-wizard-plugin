import re,sys,base64,io
from PIL import Image
MAX=int(sys.argv[3]) if len(sys.argv)>3 else 1200
src=open(sys.argv[1],encoding='utf8').read()
pat=re.compile(r'data:image/(png|jpeg|jpg);base64,([A-Za-z0-9+/=\s]+)')
def f(m):
    im=Image.open(io.BytesIO(base64.b64decode(m.group(2))))
    if im.width<=MAX: return m.group(0)
    im=im.resize((MAX,round(im.height*MAX/im.width)),Image.LANCZOS)
    b=io.BytesIO()
    if im.mode in('RGBA','LA','P') and (im.mode!='P' or 'transparency' in im.info):
        im.convert('RGBA').save(b,'PNG',optimize=True); mt='png'
    else:
        im.convert('RGB').save(b,'JPEG',quality=82,optimize=True); mt='jpeg'
    return f'data:image/{mt};base64,'+base64.b64encode(b.getvalue()).decode()
open(sys.argv[2],'w',encoding='utf8').write(pat.sub(f,src))
