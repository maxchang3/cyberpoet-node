proc select_word

para signal,words,yy_status,yunjiao,isyayun,total_number

do case

  case signal='MM' .or. signal='TT' .or. signal='DJ' .or. signal='XA'
    words=Word

  case signal='DD'
    in_string=at('/',Word)
    if in_string<>0
      words=left(Word,in_string-1)+righ(Word,len(Word)-in_string)
    else
      words=Word
    endi

  case signal='MC'
    if isyayun='Y' .and. yy_status
      do whil (Property<>'时间' .and. Property<>'地点' .and. Property<>'地名') .or. Vowel<>yunjiao
        location=int(total_number*rand())+1
        sele 8
        go location
      endd
      words=Word
    else
      do whil Property<>'时间' .and. Property<>'地点' .and. Property<>'地名'
        location=int(total_number*rand())+1
        sele 8
        go location
      endd
      words=Word
    endi

  case signal='MR'
    if isyayun='Y' .and. yy_status
      do whil (Property<>'人物' .and. Property<>'人名') .or. Vowel<>yunjiao
        location=int(total_number*rand())+1
        sele 8
        go location
      endd
      words=Word
    else
      do whil Property<>'人物' .and. Property<>'人名'
        location=int(total_number*rand())+1
        sele 8
        go location
      endd
      words=Word
    endi

  case signal='DI'
    do whil '/'$Word=.T.
      location=int(total_number*rand())+1
      sele 8
      go location
    endd
    words=Word

  case signal='DV'
    if isyayun='Y' .and. yy_status
      do whil '/'$Word=.F. .or. Vowel<>yunjiao
        location=int(total_number*rand())+1
        sele 8
        go location
      endd
    else
      do whil '/'$Word=.F.
        location=int(total_number*rand())+1
        sele 8
        go location
      endd
    endi
    in_string=at('/',Word)
    words=left(Word,in_string-1)+"着"+righ(Word,len(Word)-in_string)

  case signal='DO'
    do whil '/'$Word=.F.
      location=int(total_number*rand())+1
      sele 8
      go location
    endd
    in_string=at('/',Word)
    words=allt(righ(Word,len(Word)-in_string))+left(Word,in_string-1)+"得"

  case signal='SS'
    words=aa
  othe
endc

words=allt(words)
retu
