#!/bin/bash

if [ `id -u`  -ne 0 ]
then
    echo "--- Must be running as root"
    exit 1
fi

echo "+++ abans"
ls -al /home/sag/express-sendfile/public/imatges/webcam/*.png

rm /home/sag/express-sendfile/public/imatges/webcam/webcam_*.png

echo "+++ despres"
ls -al /home/sag/express-sendfile/public/imatges/webcam/*.png

exit 0
