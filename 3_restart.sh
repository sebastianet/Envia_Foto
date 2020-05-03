#!/bin/bash  -x

if [ `id -u`  -ne 0 ]
then
    echo "--- Must be running as root"
    exit 1
fi

strID='express-sendfile'

echo "+++ abans"
ps -ef | grep $strID | grep   -v grep   

# toKILL=$(ps -ef | grep node | grep -v grep | awk '{print $2}')
toKILL=$(ps -ef | grep $strID | grep -v grep | awk '{print $2}')
echo "want to kill ($toKILL)."

if [[ -n $toKILL ]] 
then 
        kill $toKILL 
fi

echo "+++ despres"
ps -ef | grep $strID | grep   -v grep   


fTZ="/home/sag/logs/photo_server.log"

/usr/bin/node /home/sag/express-sendfile/server.js                      >> $fTZ  2>&1      &
rv=$?

echo "[engega.sh] node photo server rc is ("$rv")."                     >> $fTZ
ps -ef | grep node | grep   -v grep                                     >> $fTZ

# sudo cat /var/log/messages
# cat      /home/sag/logs/photo_server.log
# tail -f  /home/sag/logs/photo_server.log

exit 0
