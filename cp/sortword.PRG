clea
clos data

kuming='adj'
kuming2='adj2'

sele 1
use &kuming.
zap
sele 2
use &kuming2.
coun to x
for i=1 to x
  go i
  word1=allt(Word)
  word2=''
  if int(len(word1)/2)=len(word1)/2
    for j=1 to len(word1)/2
      word2=word2+subs(word1,(len(word1)/2-j)*2+1,2)
    endf
  else
    for j=1 to (len(word1)-1)/2
      word2=word2+subs(word1,((len(word1)-1)/2-j)*2+2,2)
    endf
    word2=word2+left(word1,1)
  endi
  repl Word with word2
endf

dele file tempsort.idx
inde on Word to tempsort.idx

go top
for i=1 to x
  wordswap=Word
  vowelswap=Vowel
  classswap=Class
  propertyswap=Property
  libertyswap=Liberty
  frequencyswap=Frequency
  sele 1
  appe blan
  repl Word with wordswap, Vowel with vowelswap, Class with classswap Property with propertyswap, ;
Liberty with libertyswap, Frequency with frequencyswap
  sele 2
  skip
endf

sele 1
for i=1 to x
  go i
  word1=allt(Word)
  word2=''
  if int(len(word1)/2)=len(word1)/2
    for j=1 to len(word1)/2
      word2=word2+subs(word1,(len(word1)/2-j)*2+1,2)
    endf
  else
    for j=1 to (len(word1)-1)/2
      word2=word2+subs(word1,((len(word1)-1)/2-j)*2+1,2)
    endf
    word2=righ(word1,1)+word2
  endi
  repl Word with word2
endf

clos data
retu