clea
clos data
set talk off
set safe off
ck=''
wait "请选择要扩充的词库：0-退出 1-名词库 2-形容词库 3-不及物动词库 4-及物动词库 5-叹词库" to ck
do case
  case ck='0'
    retu
  case ck='1'
    kuming='noun'
  case ck='2'
    kuming='adj'
  case ck='3'
    kuming='verbi'
  case ck='4'
    kuming='verbt'
  case ck='5'
    kuming='interj'
  othe
endc

dd='            '
dd2='   '
dd3='    '
use &kuming.
do whil .T.
  dd='            '
  dd2='   '
  dd3='    '
  @2,2 say "请输入新词：" get dd
  read
  addword=allt(dd)
  if allt(dd)='0'
    exit
  endi
  loca for allt(Word)=addword
  if .not. eof()
    @5,2 say "已经有该词！"
    wait
    @5,0 clea
    loop
  endi
  @3,2 say "请输入韵母：" get dd2
  read
  if ck='1' .or. ck='3'
    @4,2 say "请输入属性：" get dd3
    read
  endi
  appe blan
  repl word with allt(dd),vowel with allt(dd2),property with allt(dd3)
  @5,2 say "已将该词加入词库"
  wait
  @2,0 clea
endd
set talk off
copy to temp
zap
if ck='1'
  appe from temp for property='时间'
  appe from temp for property='地点'
  appe from temp for property='地名'
  appe from temp for property='人物'
  appe from temp for property='人名'
  appe from temp for property='    '
  copy to temp
  zap
endi
appe from temp for vowel='a '
appe from temp for vowel='ai '
appe from temp for vowel='an '
appe from temp for vowel='ang'
appe from temp for vowel='ao '
appe from temp for vowel='e '
appe from temp for vowel='ei '
appe from temp for vowel='en '
appe from temp for vowel='eng'
appe from temp for vowel='er '
appe from temp for vowel='i '
appe from temp for vowel='ie '
appe from temp for vowel='ong'
appe from temp for vowel='ou '
appe from temp for vowel='r '
appe from temp for vowel='u '
appe from temp for vowel='v '
eras temp
retu
