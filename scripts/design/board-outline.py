#!/usr/bin/env python3
# Converts a design/preview board (inline-styled HTML) to a compact outline: tags, key style hints, text.
# Usage: python3 scripts/design/board-outline.py design/preview/Home-M.html > docs/boards/Home-M.txt
#        python3 scripts/design/board-outline.py design/preview docs/boards   (every *.html → <name>.txt)
import sys,re,html,os
from html.parser import HTMLParser
# Convert a board to compact structured text: keeps tag nesting as indentation, key style hints, text.
KEEP=('background','color','font-size','font-weight','clip-path','border','width','height','grid-template-columns','position','display','gap','padding','opacity','text-decoration','letter-spacing','line-height','max-width','flex')
class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.d=0; s.out=[]; s.skip=0
    def handle_starttag(s,tag,attrs):
        if tag in ('style','script','title'):
            s.skip+=1; return
        if tag in ('link','meta','head'): return
        a=dict(attrs); st=a.get('style','')
        hints=[]
        for prop in st.split(';'):
            if ':' in prop:
                k,v=prop.split(':',1); k=k.strip(); v=v.strip()
                if k in KEEP and k not in ('display','gap','padding','line-height','letter-spacing','flex','position','width','height','max-width'):
                    hints.append(f"{k}={v}")
                elif k in ('display','position') and v in ('grid','none','absolute','fixed','sticky'):
                    hints.append(f"{k}={v}")
                elif k in ('width','height') and ('px' in v and int(float(re.sub('[^0-9.]','',v) or 0))>=120):
                    hints.append(f"{k}={v}")
        extra=' '.join(f"{k}={v}" for k,v in a.items() if k in ('href','src','alt','aria-label','placeholder','value','type','checked','selected','disabled','dir','lang','viewBox'))
        if tag=='svg': extra='svg '+extra
        line='  '*s.d+f"<{tag}"+((' '+extra) if extra else '')+((' {'+'; '.join(hints)+'}') if hints else '')+'>'
        if tag in ('img','input','br','hr','path','line','circle','rect','polygon','polyline'):
            if tag not in ('path','line','circle','rect','polygon','polyline'): s.out.append(line)
            return
        s.out.append(line); s.d+=1
    def handle_endtag(s,tag):
        if tag in ('style','script','title'):
            s.skip-=1; return
        if tag in ('link','meta','head'): return
        if tag in ('img','input','br','hr','path','line','circle','rect','polygon','polyline'): return
        s.d=max(0,s.d-1)
    def handle_data(s,data):
        if s.skip: return
        t=' '.join(data.split())
        if t: s.out.append('  '*s.d+'"'+t+'"')
def outline(f):
    p=P(); p.feed(open(f,encoding='utf-8').read())
    lines=p.out
    # collapse: merge a tag line with a single following text line when the next line is deeper text only
    o=[]
    i=0
    while i<len(lines):
        l=lines[i]
        if i+1<len(lines) and lines[i+1].lstrip().startswith('"') and (i+2>=len(lines) or not lines[i+2].startswith(' '*(len(l)-len(l.lstrip())+2))):
            o.append(l+' '+lines[i+1].strip()); i+=2
        else:
            o.append(l); i+=1
    return '\n'.join(o)
args=sys.argv[1:]
if len(args)==2 and os.path.isdir(args[0]) and (os.path.isdir(args[1]) or not os.path.exists(args[1])):
    os.makedirs(args[1],exist_ok=True)
    names=sorted(n for n in os.listdir(args[0]) if n.endswith('.html') and n!='index.html')  # index.html is the preview index, not a board
    for n in names:
        with open(os.path.join(args[1],n[:-5]+'.txt'),'w',encoding='utf-8') as w:
            w.write(outline(os.path.join(args[0],n))+'\n')
    print(f"{len(names)} boards → {args[1]}")
else:
    for f in args:
        print(outline(f))
