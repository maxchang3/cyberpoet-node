yl_status=.T.
jl=len(j)
jb=subs(j,jl-1)
sele 8
go top
loca for Vowel=yjb
firstword=recno()

if eof()
  go dmb
  do select_word with jgb,c,yl_status,yjb,yl,lgb1
  j=j+trim(c)
  if jgb="DV"
    xhj=xhj+2
  endi
  retu
endi

coun to ys whil trim(Vowel)=yjb

sele 8
go top
skip firstword-1
dmb=ys*rand()
skip dmb

do select_word with jgb,c,yl_status,yjb,yl,lgb1
j=j+trim(c)
if jgb="DV"
  xhj=xhj+2
endi
yl_status=.F.
retu
