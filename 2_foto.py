import numpy
# print "### NUMPY version I have is " + numpy.__version__

import cv2
# print "### CV2 version I have is " + cv2.__version__

# Fer una foto amb la webcam i posar-la en un fitxer.
# Es crida des "1_sem.js"
# Imprimim el nom del fitxer que sera el parametre de tornada
# No imprimim res mes

# Documentacio
#     # http://docs.opencv.org/2.4/modules/highgui/doc/reading_and_writing_images_and_video.html

# to debug this code, use
#      python  -m pdb  3-v-en-color.py

import time
timestr = time.strftime("%Y%m%d_%H%M%S")
# print timestr

szShortFN = 'webcam_' + timestr + '.png' 
# print 'Filename (' + szShortFN + ').'

szFN = '/home/pi/semafor/public/images/webcam/' + szShortFN 
# print 'Large Filename (' + szFN + ').'

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
cap.set( cv2.cv.CV_CAP_PROP_FRAME_WIDTH, 320 )     # 1280 1024 800 640 320
cap.set( cv2.cv.CV_CAP_PROP_FRAME_HEIGHT, 240 )    # 1024  800 600 480 240
# cv2.waitKey( 3000 )

if ( cap.isOpened() ):
 
    for count in range(0,5):

        ret, frame = cap.read()  # VideoCapture::read returns a Boolean and a Numpy

        if ret:     # proceed only if we have a frame

            if ( count == 4 ):
                cv2.imwrite ( szFN, frame )
                print szFN                   # set return parameter for NODE
        
        else:
            print '--- VideoCapture::read no ha anat be'

# When everything done, release the capture
cap.release()                                # close the already opened camera
cap = None
