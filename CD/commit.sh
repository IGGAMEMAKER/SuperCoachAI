cmt=$1
libs=$2
source nvmuse.sh
if [ -z "$cmt" ]
then
  echo 'Type commit name!'
else
  cd ../
  rm -f ./.git/index.lock
  git commit -a -m "$cmt"
  git push
  cd CD/ || exit
  node serverManager.js update "$libs"
fi