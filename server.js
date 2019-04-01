#!/usr/bin/env node

// aquesta app de nodejs fa una foto amb una webcam conectada al USB del raspberry i la envia en una pagina html
//
// Versions :
//  1.1.a 20190216 - inici
//  1.1.b          - posar rpi-gpio : npm install rpi-gpio --save
//  1.1.c          - posar python-shell : npm install python-shell --save     https://github.com/extrabacon/python-shell
//                     error : https://github.com/extrabacon/python-shell/issues/177
//                     ens cal python-shell v0.4.0 maxim (unless we go node v11) - see package.json
//  1.1.d          - posar morgan : npm install morgan --save
//  1.1.e          - engegar timeout
//  1.1.f          - timestamp

var myVersion  = "1.1.f" ;
var png_File   = '/home/sag/express-sendfile/public/imatges/webcam/webcam.png' ; // created by python
var Detalls = 1 ;                                                                // control de la trassa que generem via "mConsole"

var express = require( 'express' );
var app     = express();

var path    = require( 'path' );
var logger  = require( 'morgan' );                      // log requests to the console (express4)
var fs      = require( 'fs' ) ;                         // get JPG or PNG

var gpio         = require( 'rpi-gpio' ) ;              // GPIO pin access
var PythonShell  = require( 'python-shell' ) ;          // send commands to python

require('dotenv').config();
app.set( 'cfgPort', process.env.PORT || '8080' ) ;
app.set( 'cfgLapse_Gen_HTML', 60000 ) ;             // mili-segons - gen HTML every ... 3 minuts = 180 segons = 180000 mSg

app.use( express.static( path.join( __dirname, '/public' ))) ;

// eina per depurar el programa
app.use( logger( 'dev' ) ) ;                            // tiny (minimal), dev (developer), common (apache)

// *** implement few own functions

// Date() prototypes - use as 
//    var szOut = (new Date).yyyymmdd() + '-' + (new Date).hhmmss() + ' ' + szIn + '<br>' ;
// or better
//    var szOut = genTimeStamp() + ' ' + szIn + '<br>' ;

Date.prototype.yyyymmdd = function ( ) { 

     var yyyy = this.getFullYear().toString();                                    
     var mm   = (this.getMonth()+1).toString(); // getMonth() is zero-based         
     var dd   = this.getDate().toString();
     return yyyy + '/' + (mm[1]?mm:'0'+mm[0]) + '/' + (dd[1]?dd:'0'+dd[0]);

}; // yyyymmdd()

Date.prototype.hhmmss = function () {

     function fixTime(i) {
          return (i < 10) ? "0" + i : i;
     }
     var today = new Date(),
          hh = fixTime( today.getHours() ),
          mm = fixTime( today.getMinutes() ),
          ss = fixTime( today.getSeconds() ) ;
     var myHHMMSS = hh + ':' + mm + ':' + ss ;
     return myHHMMSS ;

} ; // hhmmss()
 
// get a timestamp
function genTimeStamp ( arg ) {

    var szOut = (new Date).yyyymmdd() + ' - ' + (new Date).hhmmss() ;
    return szOut ;

} ; // genTimeStamp()

// log output control
function mConsole ( szIn ) {

    if ( Detalls == 1 ) {
        console.log( genTimeStamp() + ' - ' + szIn ) ;
    } ;

} ; // mConsole()


// set timeout
    setInterval( myTimeout_Gen_HTML_Function, app.get( 'cfgLapse_Gen_HTML' ) ) ; // lets call own function every defined period


// what to do on timeout
function myTimeout_Gen_HTML_Function ( arg ) { // generate new page "/public/foto_seq.html"

    var szOut = ">>> timeout (" + app.get( 'cfgLapse_Gen_HTML' ) + ") generar FOTO_SEQ.HTML, dirname {"+ __dirname + "}." ;
    mConsole( szOut ) ;

    var newFN = __dirname + '/public/foto_seq.html' ;
    mConsole( '>>> write new ' + newFN ) ;

    var S1 = '<p>\n' ;
    var S2 = '&nbsp; Time is (' ;
    var S3 = genTimeStamp() ;
    var S4 = ')</p>\n' ;

    fs.writeFile( newFN, S1+S2+S3+S4, (err) => {

        if (err) throw err ;
        mConsole( '+++ file ' + newFN + ' has been saved!' ) ;
    } ) ; // write "pagina.nova"

} ; // myTimeout_Gen_HTML_Function()


// +++ set express branches

app.get( '/', function( req, res ) {
    mConsole( '+++ send INDEX.HTML' ) ;
    res.sendFile( 'index.html' ) ;
} ) ;

app.get( '/foto_seq', function ( req, res ) {
     mConsole( '+++ foto seq - NIY' ) ;
} ) ; // display html page with sequence of pictures


app.get( '/fem_foto', function ( req, res ) {

var szResultatPhoto = "* PHOTO *" ;

var python_options = {
  mode: 'text',
  pythonPath: '/usr/bin/python',
  pythonOptions: ['-u'],
  scriptPath: '/home/sag/express-sendfile',
  args: ['value1', 'value2', 'value3']
} ;

// lets call /home/sag/express-sendfile/2_foto.py

     mConsole( '+++ fer foto' ) ;

     PythonShell.run( '2_foto.py', python_options, function( err, results ) {
          if ( err ) throw err ;
          console.log( '(+) Python results are (%j).', results ) ; // results is an array consisting of messages collected during execution
          png_File = String( results ) ;                           // convert to string

          mConsole( '+++ enviem photo [' + png_File + '].' ) ;

          var imatge = fs.readFileSync( png_File ) ;

          res.writeHead( 200, { 'Content-Type': 'text/html' } ) ;
          res.write( '<p> &nbsp; * pic id * </p>' ) ;
          res.write( '<img class="img_brd" id="imatge_webcam" width="320" height="240" src="data:image/png;base64,' ) ;
          res.write( new Buffer(imatge).toString( 'base64' ) ) ;
          res.end( '"/>' ) ;

     } ) ; // run

} ) ; // do photo and send its name


// +++ start server

app.listen( app.get( 'cfgPort' ), () => {
    mConsole( '... app SENDPHOTO listening on port {'+ app.get( 'cfgPort' ) + '} ...' )
} ) ;
