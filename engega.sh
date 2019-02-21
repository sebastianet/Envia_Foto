#!/bin/bash

if [ `id -u`  -ne 0 ]
then
    echo "--- Must be running as root"
#    exit 1
fi

fTZ="/home/sag/logs/photo_server.log"
# clear

szOUT="==== [`date -R`] === ($0) === start node PHOTO SERVER. user($USER) host($HOSTNAME)"
echo $szOUT                                                                >> $fTZ

ipEXT=$(curl -s icanhazip.com);
szIP="[`date -R`] external IP is {$ipEXT}. External port 9009, internal 8081."
echo $szIP                                                              >> $fTZ

sudo    /usr/bin/node /home/sag/express-sendfile/server.js              >> $fTZ  2>&1      &
rv=$?
echo "node photo server rc is ("$rv")."                                 >> $fTZ
ps -ef | grep node | grep   -v grep                                     >> $fTZ

exit 0
