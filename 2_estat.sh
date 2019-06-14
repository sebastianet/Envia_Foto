#!/bin/bash

clear

strID='express-sendfile'

echo "(1) +++ estat del node"
ps -ef | grep $strID | grep   -v grep   

echo "(2) +++ ports"
sudo netstat -tulpn | grep LISTEN | grep $strID

echo "(3) +++ la meva IP externa"
curl -m 2  -s icanhazip.com

exit 0
