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

var myVersion  = "1.1.d" ;
var png_File   = '/home/sag/express-sendfile/public/imatges/webcam/webcam.png' ; // created by python

var express = require( 'express' );
var app     = express();

var path    = require( 'path' );
var logger  = require( 'morgan' );                      // log requests to the console (express4)
var fs      = require( 'fs' ) ;                         // get JPG or PNG

var gpio         = require( 'rpi-gpio' ) ;              // GPIO pin access
var PythonShell  = require( 'python-shell' ) ;       // send commands to python

require('dotenv').config();
app.set( 'cfgPort', process.env.PORT || '8080' ) ;

app.use( express.static( path.join( __dirname, '/public' ))) ;

// eina per depurar el programa
app.use( logger( 'dev' ) ) ;                            // tiny (minimal), dev (developer), common (apache)


// +++ set express branches

app.get( '/', function( req, res ) {
    res.sendFile( 'index.html' ) ;
} ) ;

app.get( '/fem_foto', function ( req, res ) {

var szResultatPhoto = "* PHOTO *" ;

var python_options = {
  mode: 'text',
  pythonPath: '/usr/bin/python',
  pythonOptions: ['-u'],
  scriptPath: '/home/sag/express-sendfile',
  args: ['value1', 'value2', 'value3']
} ;

// lets call /home/pi/semafor/2_foto.py

     console.log( '+++ fer foto' ) ;

     PythonShell.run( '2_foto.py', python_options, function( err, results ) {
          if ( err ) throw err ;
          console.log( '(+) Python results are (%j).', results ) ; // results is an array consisting of messages collected during execution
          png_File = String( results ) ;                           // convert to string

          console.log( '+++ enviem photo ' + png_File ) ;

          var imatge = fs.readFileSync( png_File ) ;

          res.writeHead( 200, { 'Content-Type': 'text/html' } ) ;
          res.write( '<img id="imatge_webcam" width="320" height="240" src="data:image/png;base64,' ) ;
          res.write( new Buffer(imatge).toString( 'base64' ) ) ;
          res.end( '"/>' ) ;

     } ) ; // run

} ) ; // do photo and send its name


// +++ start server

app.listen( app.get( 'cfgPort' ), () => {
    console.log( '... app SENDPHOTO listening on port {'+ app.get( 'cfgPort' ) + '} ...' )
} ) ;
