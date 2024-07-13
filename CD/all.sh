#pm2 delete all
pm2 delete LogServer
pm2 delete Worker
pm2 delete DB
pm2 delete index
pm2 flush

sleep 1
pm2 start LogServer.js
sleep 1
pm2 start Worker.js
sleep 2
pm2 start DB.js
sleep 3
pm2 start index.js

pm2 logs