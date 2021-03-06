#!/usr/bin/env node

// aquesta app de nodejs fa :
//     escolta al port 2415 (definit al fitxer ".env")
//     una foto 320x240 amb una webcam conectada al USB del raspberry i la envia en una pagina html
//     una sequencia de fotos 160x120 - s'envia el nom del fitxer en un objecte JSON i el client el demana i posiciona
//   si hi ha un error en fer la foto des python, el client demana "bio_hazard.png" - see /public/client.js
//   despres de posar la foto a la pagina, es posa "webcam_160x120.png" a la casella seguent, esborrant la foto de la volta anterior
//   la APP es accessible des Internet amb la IP del Router i el port 8815 (myraspiodin.hopto.org:8815)
//
// fitxers complementaris :
//     ./public/client.js      codi JS que executa en el browser client
//     ./public/index.htm      conte els identificadors dels camps on posem les fotos i el texte
//
// doc :
//     https://docs.opencv.org/3.0-beta/modules/imgcodecs/doc/reading_and_writing_images.html
//     https://github.com/extrabacon/python-shell
//     https://www.npmjs.com/package/python-shell
//
// git repository : https://github.com/sebastianet/Envia_Foto
// git commands :
//     git commit -am "version description"
//     git push -u origin master
//
// pending :
//     prevent multiple clients concurrently
//     trace all express branches
//     python error :
//          rspi doesn't like old USB 1.1 webcams 
//
// Versions :
//   1.1.a 20190216 - inici
//   1.1.b          - posar rpi-gpio : npm install rpi-gpio --save
//   1.1.c          - posar python-shell : npm install python-shell --save     https://github.com/extrabacon/python-shell
//                      error : https://github.com/extrabacon/python-shell/issues/177
//                      ens cal python-shell v0.4.0 maxim (unless we go node v11) - see package.json
//   1.1.d          - posar morgan : npm install morgan --save
//   1.1.e          - engegar timeout
//   1.1.f          - timestamp
//   1.1.g          - fes_photo_gimme_json
//   1.1.h          - using same filename, avoid 304 using "random"
//   1.1.i          - use small image
//   1.1.j          - try to catch python error
//   1.1.k          - display 5 images 320x240
//   1.1.l          - timestamp images on 2nd row
//   1.1.m          - timestamp images on 2nd row properly
//   1.1.n 20190408 - display 10 images 160x120
//   1.1.o 20190410 - trace all static files we serve
//   1.1.p          - log an initial line showing version
//   1.1.q          - send ID on DOM ready()
//   1.1.r 20190413 - timestamp PythonResults
//   1.1.s          - client posts "timer stop" and "timer start" events
//   1.1.t          - trace Python results properly
//   1.1.u 20190520 - verify "OK" in JSON
//   1.1.v 20190614 - client asks for filename in json ; on respinse, it requests it and puts it in html
//   1.1.w 20190614 - trace timeout at client, so python does not crash
//   1.1.x 20190617 - catch ENOENT and EADDRINUSE 
//   1.1.y 20200503 - improve some traces
//   1.1.z 20200719 - locate .env properly from root
//

// les meves variables i constants
// ================================

var myVersio  = "1.1.z" ;
var png_File  = '/home/sag/express-sendfile/public/imatges/webcam/fwc.png' ;  // created by python
var Detalls   = 1 ;                                                           // control de la trassa que generem via "mConsole"

// moduls que ens calen
// =====================

var express = require( 'express' );
var app     = express();
var path    = require( 'path' );
var logger  = require( 'morgan' );                      // log requests to the console (express4)
var fs      = require( 'fs' ) ;                         // get JPG or PNG

var gpio         = require( 'rpi-gpio' ) ;              // GPIO pin access
// var PythonShell  = require( 'python-shell' ) ;          // send commands to python
let {PythonShell}  = require( 'python-shell' ) ;  
var sprintf      = require('sprintf-js').sprintf ;      // npm install sprintf-js

// configuracio
// =============

// require( 'dotenv' ).config() ;                          // npm install dotenv
console.log( require( 'dotenv' ).config({path:__dirname+'/.env'}) ) ;

app.set( 'cfgPort', process.env.PORT || '8080' ) ;
app.set( 'cfgLapse_Gen_HTML', 60000 ) ;                 // mili-segons - gen HTML every ... 3 minuts = 180 segons = 180000 mSg
app.set( 'appHostname', require('os').hostname() ) ;

// eina per depurar el programa
app.use( logger( 'dev' ) ) ;                            // tiny (minimal), dev (developer), common (apache)

// as there are multiple places we do a python photo, here are the global options
var python_options = {
  mode: 'text',
  pythonPath: '/usr/bin/python',
  pythonOptions: ['-u'],
  scriptPath: '/home/sag/express-sendfile',
  args: [ 'imatges/webcam/webcam3.png', 'value2.jpeg', 'value3' ]    // only place where we specify the picture filename
} ;

// string to identify this program. Sent to own log at start and to client on request
szID = 'app SEND PHOTO. Versio (' + myVersio + '), listening on port {'+ app.get( 'cfgPort' ) + '}.' ;

// *** implement few own functions
// ================================

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
//    var szOut = ">>> lets set timeout (" + app.get( 'cfgLapse_Gen_HTML' ) + ")." ;
//    mConsole( szOut ) ;
//    setInterval( myTimeout_Gen_HTML_Function, app.get( 'cfgLapse_Gen_HTML' ) ) ; // lets call own function every defined period


// what to do on timeout
function myTimeout_Gen_HTML_Function ( arg ) { // generate new page "/public/foto_seq.html"

    var szOut = ">>> event : timeout (" + app.get( 'cfgLapse_Gen_HTML' ) + ") generar FOTO_SEQ.HTML, dirname {"+ __dirname + "}." ;
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

// trace all the requirements we serve :
app.use( function ( req, res, next ) {
    const my_url = req.url ;
    const my_path = req.path ;
    var szOut = '### Request - URL (' + my_url + '), PATH (' + my_path + ').' ;
    mConsole( szOut ) ;
    next() ;
} ) ; // timestamp all

// branch to serve static files must be later that branch tracing all traffic 
app.use( express.static( path.join( __dirname, '/public' ))) ; // serve static files

//
// app.get( '/', function( req, res ) {
//     mConsole( '+++ send INDEX.HTML' ) ;
//     res.sendFile( 'index.html' ) ;
// } ) ; // app.get( '/'


// client uses : $.post( '/send_status_to_client/opid=stop_sequence'
app.post ( '/send_status_to_client/opid=:cli_opcode&opto=:cli_to', function ( req, res ) {  // client post "stop timer"
var Operacio = req.params.cli_opcode ;
var Lapse = req.params.cli_to ;
let sz_Opcode = genTimeStamp() + " *** operacio al client : (" + Operacio + "), lapse ("+ Lapse + ") ***" ;
    mConsole( '+++ POST (' + sz_Opcode + ').' ) ;
    res.writeHead( 200, { 'Content-Type': 'text/html' } ) ; // write HTTP headers 
    res.write( sz_Opcode ) ;
    res.end( ) ;
} ) ; // post

// app.get( '/gimme_ID'
app.get( '/gimme_ID', function ( req, res ) {  // client request for identification
    mConsole( '+++ send ID (' + szID + ').' ) ;
    res.writeHead( 200, { 'Content-Type': 'text/html' } ) ; // write HTTP headers 
    res.write( szID ) ;
    res.end( ) ;
} ) ; // app.get( '/gimme_ID'

//
app.get( '/fes_photo_gimme_json', function ( req, res ) {

    var fixed_png_File = python_options.args[0] ; // "imatges/webcam/webcam3.png"

    mConsole( '+++ /get fes foto, gimme json' ) ;

    PythonShell.run( 'fer_foto.py', python_options, function( err, results ) { // results is an array of messages collected during execution

        if ( err ) {                                                 // got error in python shell -> send a specific "error" pic

            var szErr = '--- Python error. ' ;
            szErr += 'Path (' + err.path + '). ' ;
            szErr += 'Stack (' + err.stack + '). ' ;
            console.log( szErr ) ;
            throw err ;                                              // fatal error : stop 

        } else {

//            var sz_PY_result = sprintf( '(+) Python results #1 are (%j).', results ) ;
//            mConsole( sz_PY_result ) ;                          
//            console.log( '(+) Python results #1 are (%j).', results ) ;

            png_File = String( results[0] ) ;                        // convert to string
            mConsole( "(+1) python filename (" + png_File + ")." ) ;                          

            if ( png_File.length > 1 ) {

                res.writeHead( 200, { 'Content-Type': 'application/json' }) ;
                let my_json = { status: 'OK', imgURL: fixed_png_File } ;
                res.end( JSON.stringify( my_json ) ) ;

            } else { // no pic == filename = "."

                let my_json = { status: 'KO', imgURL: fixed_png_File } ;
                res.end( JSON.stringify( my_json ) ) ;

            } ;

        } ; // no error

    } ) ; // run PythonShell

} ) ; // get(/fes_photo_gimme_json) do photo and send its name

//
app.get( '/fem_foto', function ( req, res ) {

var szResultatPhoto = "* PHOTO *" ;

// lets call /home/sag/express-sendfile/fer_foto.py

    mConsole( '+++ /get fer foto' ) ;

    PythonShell.run( 'fer_foto.py', python_options, function( err, results ) {

        if ( err ) {                                                 // got error in python shell -> send a specific "error" pic

            var szErr = '--- Python error. ' ;
            szErr += 'Path (' + err.path + '). ' ;
            szErr += 'Stack (' + err.stack + '). ' ;
            console.log( szErr ) ;
            throw err ;                                              // fatal error : stop 

        } else {

//            var szPyth = `(+) Python results are (%j).`, results ;
//            mConsole( szPyth ) ;                                     // results is an array of messages collected during execution

            png_File = String( results[0] ) ;                        // convert to string
            mConsole( "(+2) get single photo into file (" + png_File + ")." ) ;                          

            if ( png_File.length > 1 ) {

                try {

                    var imatge = fs.readFileSync( png_File ) ;
                    res.writeHead( 200, { 'Content-Type': 'text/html' } ) ;
                    res.write( '<p> &nbsp; * pic id * </p>' ) ;
                    res.write( '<img class="img_brd" id="imatge_webcam" width="320" height="240" src="data:image/png;base64,' ) ;
                    res.write( new Buffer(imatge).toString( 'base64' ) ) ;
                    res.end( '"/>' ) ; // tanca tag "<img"

                } catch (err) {

                    if (err.code === 'ENOENT') {
                        console.log( '--- ENOENT : File not found at /fem_foto' ) ;
                    } else {
                        throw err;
                    } ;

                } ; // try fs.readFileSync()

            } else {

                res.writeHead( 200, { 'Content-Type': 'text/html' } ) ;
                res.write( '<p> &nbsp; * pic error * </p>' ) ;
                res.end( ) ;

            } ; // lng > 1

        } ; // no error

    } ) ; // run PythonShell

} ) ; // do photo and send it using HTML

// +++ start server

app.listen( app.get( 'cfgPort' ), () => {
    mConsole( szID ) ;
} ).on( 'error', function( err ) {
    if ( err.errno === 'EADDRINUSE' ) { // catch port in use error
        console.error( '--- port (' + app.get( 'cfgPort' ) + ') busy, process.exit() ---' );
        process.exit() ;
    } else {
        console.log( err ) ;
    } ;
} ) ; // app.listen
