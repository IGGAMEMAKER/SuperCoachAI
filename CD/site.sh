cmt=$1
source nvmuse.sh

git commit -a -m "Site update: $cmt"
git push
node serverManager.js site