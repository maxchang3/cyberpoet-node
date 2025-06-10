set proc to proc_1
clos data
yl_status=.F.

xx=1
?  "已写好",xx-1,"行"


use cpcs
mcsb=mms
dcsb=dds
djcsb=djs
xxcsb=xxs
ttscsb=tts
ssscsb=sss
jgcsb=jgs
use
j=''

sele 6
use cp
zap
sele 7
use cpjgd
coun to x
go top

do whil xx<=x

  xhj=0
  j=''

  do whil xhj<27
    sele 7
    xhj=xhj+1
    zd='J'+allt(str(xhj,2))
    jgb=&zd.

    sele 8
    do case
      case jgb='DD' .or. jgb='DV' .or. jgb='DO' .or. jgb='DI'
        use verbi
        lgb1=dcsb
      case jgb='DJ'
        use verbt
        lgb1=djcsb
      case jgb='MM' .or. jgb='MC' .or. JGB='MR'
        use noun
        lgb1=mcsb
      case jgb='XA'
        use adj
        lgb1=xxcsb
      case jgb='TT'
        use interj
        lgb1=ttscsb
      case jgb='SS'
        use cpss
        lgb1=ssscsb
      case jgb='  '
        exit
      othe
        c=jgb
        j=j+trim(c)
        loop
    endc
  
    dmb=int(lgb1*rand())+1
    sele 8

    go dmb
    do select_word with jgb,c,yl_status,yjb,yl,lgb1
    j=j+trim(c)
    if jgb="DV" .or. jgb="DO"
      xhj=xhj+2
    endi
  endd

  sele 7
  j=j+punct
  sele 6
  appe blan
  repl poem with j
  @row(),8 say xx
  sele 7
  if .not.eof()
    skip
  else
    go top
  endi
  xx=xx+1
endd

clos data
retu
