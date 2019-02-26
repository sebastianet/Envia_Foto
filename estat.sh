#!/bin/bash

clear

echo "(1) +++ estat del node"
ps -ef | grep node | grep   -v grep   

echo "(2) +++ ports"
sudo netstat -tulpn | grep LISTEN | grep node

echo "(3) +++ la meva IP externa"
curl -s icanhazip.com

exit 0
