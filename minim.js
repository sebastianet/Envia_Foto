
const express = require('express') ;
const path    = require('path') ;
const app     = express() ;

const PORT = 3000 ;

app.use( function ( req, res, next ) {
    const { url, path: routePath } = req ;
    console.log( '### common TimeStamp:', Date.now(), ' - my LOGGER - URL (' + url + '), PATH (' + routePath + ').' ) ;
//    console.log( req ) ; // quite large output
    next() ;
} ) ; // timestamp all

app.use( express.static( path.join( __dirname, '/public' ) ) ) ;

app.listen(PORT, () => {
  console.log( `app is running on port ${PORT}.` ) ;
} ) ;
