*2004年3月2日起，本程序重新开始升级
*变量说明见variable.txt文件

set defa to .
publ jgb,dmb,lgb1,c
yl_status=.F.
set talk off
set safe off
set exac on
clos data
*use cp1
*zap
clea
? "正在启动程序，请稍候..."
clea

*显示题头
text
≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌

　　听吧！
endt
ageyear=year(date())-2002
agemonth=mont(date())-4
ageday=day(date())-4
do case
  case ageyear<>0
    ? ageyear,'岁的计算机诗人火鸟将为您歌唱！'
  case ageyear=0 .and. agemonth<>0
    ? agemonth,'个月大的计算机诗人火鸟将为您歌唱！'
  othe
    ? ageday,'天大的计算机诗人火鸟将为您歌唱！'
endc
text
　　　　　　　　　　　　　　　　　　Version 1.21c
生日：2002年4月4日　　　　　　　　┌──────┐
星座：白羊座　　　　　　　　　　　│原作：刘慈欣│
籍贯：山西平定娘子关　　　　　　　│改编：诸葛恒│
爱好：写诗　　　　　　　　　　　　└──────┘
　　　　　　　　　　　　　最后更新于2004年3月5日

≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌
endt
*题头显示结束

wait

quit_cp='Y'
do whil uppe(quit_cp)='Y'

  set proc to proc_2
  ? '请输入以下内容，以使我的创作多少有点根据：'
  wait "你要宁静的风格吗？（反之则是奔放的风格）[Y/N]" to fengge
  fengge=uppe(fengge)

  inpu "分多少段（请输入数字，输入1为不分段）？" to dsb
  if dsb=1
    inpu '您让我作多少行的诗呢（请输入数字）？' to hsb
  else
    inpu "每段多少行（请输入数字）？" to hsb
  endi

  wait '需要押韵吗（最好不要，因为押韵后灵感会受到一定束缚）[Y/N]？' to yl
  yl=uppe(yl)

  if yl<>'Y'
    yjb=''
    do create_structure with dsb,hsb,fengge,yjb
    do cpzh
  else
    clea
    ? '请输入韵脚(v代表ü, r代表知、吃、诗、日的韵母, z代表资、雌、思的韵母)'
    acce '[选择以下之一：a, ai, an, ang, ao, e(o,uo), ei(ui), en(in,un,vn), eng(ing), er, i, ie(ve), ong, ou(iu), r(z), u, v]'  to yjb
    yjb=lowe(allt(yjb))
    do case
      case yjb='o' .or. yjb='uo'
        yjb='e'
      case yjb='ui'
        yjb='ei'
      case yjb='in' .or. yjb='un' .or. yjb='vn'
        yjb='en'
      case yjb='ing'
        yjb='eng'
      case yjb='ve'
        yjb='ie'
      case yjb='iu'
        yjb='ou'
      case yjb='z'
        yjb='r'
      othe
    endc
    do create_structure with dsb,hsb,fengge,yjb
    do cpzhy
  endi

  ? chr(7)
  wait '诗已全部写完了，请欣赏吧（按任意键继续）！'
  clea
  sele 1
  use cp
  coun to hang
  for i=1 to hang
    go i
    poemtrim=rtri(poem)
*rtri函数：删除字符串末尾的空格
    if int((i-1)/30)=(i-1)/30 .and. i<>1
      @row(),0
      @row(),2 say poemtrim
    else
      ? "  "+poemtrim
    endi
    if int(i/30)=i/30
      wait
    endi
  endf

  ?
  wait '满意吗？[Y/N]' to x
  clea
  if uppe(x)='Y'
    acce '请赐题：' to tm
    ? '好，我将它存起来，以供以后欣赏……'
    sele 2
    use cpcs
    poemnumber=allt(str(poemnum))
    for i=1 to 6-len(poemnumber)
      poemnumber='0'+poemnumber
    endf
    poemfilename='cp'+poemnumber+'.txt'
    enter=chr(13)+chr(10)
    fp=fcre('&poemfilename.')
    =fwri(fp,'**************************************'+enter)
    =fwri(fp,tm+enter)
    =fwri(fp,'（作品第'+poemnumber+'号）'+enter)
    =fwri(fp,'**************************************'+enter)
    sele 1
    for i=1 to hang
      go i
      poemtrim=rtri(poem)
      =fwri(fp,poemtrim+enter)
    endf
    =fclo(fp)
    sele 2
    repl poemnum with poemnum+1
  else
    ? '唉，那我就把它扔到纸篓里了！'
  endi
  wait
  clea
  wait '再作一首如何？没关系，不费劲儿的！[Y/N]' to quit_cp

endd

?
? '那么，我先歇歇喝口水啦！'
clos data
retu
