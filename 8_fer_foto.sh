#!/bin/bash

echo "(1) +++ fem foto"
# python  /home/sag/express-sendfile/fer_foto.py    
python  /home/sag/express-sendfile/fer_foto.py              ./imatges/webcam/aaaaa11111.png    1
# python  -m pdb  /home/sag/express-sendfile/fer_foto.py      aaaaa11111.png    2 

echo "(2) +++ imatges que tenim"
ls -al /home/sag/express-sendfile/public/imatges/webcam/*

exit 0
