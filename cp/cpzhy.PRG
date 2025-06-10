set proc to proc_1
clos data

cycle_i=0
? "已写好",cycle_i,"行"

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

for cycle_i=1 to x

  sele 7
  csb=cs
  h=0
  j=''

  xhj=0
  do whil xhj<27  
    sele 7
    xhj=xhj+1
    xhj1=xhj+1
    zd='J'+allt(str(xhj,2))
    zd1='J'+allt(str(xhj1,2))
    jgb=&zd.
    jgb1=&zd1.

    sele 8
    do case
      case jgb='DD' .or. jgb='DV' .or. jgb='DO' .or. jgb='DI'
        use verbi
        lgb1=dcsb
      case jgb='DJ'
        use verbt
        lgb1=djcsb
      case jgb='MM' .or. jgb='MC' .or. jgb='MR'
        use noun
        lgb1=mcsb
      case jgb='XA'
        use adj
        lgb1=xxcsb
      case jgb="TT"
        use interj
        lgb1=ttscsb
      case jgb='SS'
        use cpss
        lgb1=ssscsb
      case jgb='  '
        exit
      othe
        c=jgb
        j=j+TRIM(c)
        loop
    endc

    dmb=int(lgb1*rand())+1
    sele 8
    yushu=0
    yushu=mod(cycle_i,hsb+1)
    panduan=0
    if int(hsb/2)=hsb/2
      panduan=(yushu=1 .or. int(yushu/2)=yushu/2)
    else
      panduan=(int((yushu+1)/2)=(yushu+1)/2)
    endi

    if panduan
      if xhj=csb .and. csb<>0
        do cpyl
        exit
      endi
    endi

    go dmb
    yl_status=.F.
    
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
  @row(),7 say cycle_i
  sele 7
  if .not. eof()
    skip
  endi

endf

clos data
retu
