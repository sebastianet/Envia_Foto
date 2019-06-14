#!/bin/bash

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

exit 0
