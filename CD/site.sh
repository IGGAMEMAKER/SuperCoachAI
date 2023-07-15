cmt=$1
nvm use stable

git commit -a -m "Site update: $cmt"
git push
node serverManager.js site