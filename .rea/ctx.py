import sys,glob,re,os
pat=re.compile(sys.argv[1]); width=int(sys.argv[2]) if len(sys.argv)>2 else 150; maxn=int(sys.argv[3]) if len(sys.argv)>3 else 6
for f in glob.glob('files/**/*.js',recursive=True):
    s=open(f,errors='ignore').read(); n=0
    for m in pat.finditer(s):
        print(f"[{os.path.basename(f)}] ..."+s[max(0,m.start()-width):m.end()+width].replace('\n',' ')+"...")
        n+=1
        if n>=maxn: break
