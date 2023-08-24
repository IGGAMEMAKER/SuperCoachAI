cmt=$1
nvm use 16

git commit -a -m "Site update: $cmt"
git push
node serverManager.js site