import numpy
# print "### NUMPY version I have is " + numpy.__version__

import cv2
# print "### CV2 version I have is " + cv2.__version__

# Fer una foto amb la webcam i posar-la en un fitxer.
# Es crida des
#  /home/sag/express-sendfile/server.js
#                            /8_fer_foto.sh
#  i ens donen com parametre el nom del fitxer on posar la foto
#
# La comunicacio cap al nodejs es el array de "print" que fem en el programa python.
#
# Per aquesta aplicacio, imprimim nomes el nom del fitxer que sera el parametre de tornada
# Per problemes de sincronisme, fem 5 fotos i retornem la penultima
#
# Versions :
#  1.a 20190320 - copiem de "/home/pi/semafor"
#  1.b 20190403 - fem servir un sol fitxer i el seu nom es parametre de entrada
#  1.c 20190615 - always return a non-empty string
#

# Documentacio
#     # http://docs.opencv.org/2.4/modules/highgui/doc/reading_and_writing_images_and_video.html

# to debug this code, use
#      python  -m pdb  fer_foto.py        # Under PDB, use "n" to execute this line, use "q" to quit program.

import time
timestr = time.strftime("%Y%m%d_%H%M%S")
# print timestr

szShortFN = 'webcam_' + timestr + '.png'  # default filename, calculated
import sys

numArg = len(sys.argv)
if ( numArg > 1 ) :                       # if we have parameter
     szShortFN = sys.argv[1]              #  then use it
# print 'Filename (' + szShortFN + ').'     # display filename to use

szFN = '/home/sag/express-sendfile/public/' + szShortFN     # this is the full name
# print 'Large Filename (' + szFN + ').'
szReturnArray = '. no pic .'                                # default return value for node, indicating "no pic"

# print '>>> do VideoCapture()'
cap = cv2.VideoCapture( 0 ) 
if not cap:
    print '--- no trobo la webcam'
    sys.exit(1)

if not cap.isOpened() :
#     print '>>> do VideoCapture::open()'
    bRC = cap.open( 0 )
#     print '+++ open() bRC is (' + str(bRC) + ').'

# try using own values
# print '>>> set W 320, H 240.'
# print '>>> set W 160, H 120.'
cap.set( cv2.cv.CV_CAP_PROP_FRAME_WIDTH, 160 )     # 1280 1024 800 640 320 ?160
cap.set( cv2.cv.CV_CAP_PROP_FRAME_HEIGHT, 120 )    # 1024  800 600 480 240 ?120
# cv2.waitKey( 3000 )

if ( cap.isOpened() ):
 
    for count in range(0,5):

        ret, frame = cap.read()  # VideoCapture::read returns a Boolean and a Numpy

        if ret:     # proceed only if we have a frame

            if ( count == 4 ):
                cv2.imwrite ( szFN, frame )
                szReturnArray = szFN                   # set return parameter for NODE, indicating "pic" filename
        
        else:
            szReturnArray = '--- VideoCapture::read no ha anat be'

print szReturnArray                          #

# When everything done, release the capture
cap.release()                                # close the already opened camera
cap = None
