#!/bin/bash

echo "(1) +++ estat del node"
ps -ef | grep node | grep   -v grep   

echo "(2) +++ ports"
sudo netstat -tulpn | grep LISTEN | grep node

exit 0
