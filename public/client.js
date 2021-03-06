
// +++ variables

var myTimer = 0 ;
let kSeconds = 45 ;
let cntPics = 0 ;

let maxPics = 10 ;   // compte que index.htm ha de tenir els IDs corresponents ! img(320x240) en caben 5 ; img(160x120) en caben 10 
let idxPics = 0 ;
let timBusy = 0 ;    // intentem controlar el retard del servidor ...

// let img_buida = "imatges/webcam/webcam_320x240.png" ;
let img_buida = "imatges/webcam/webcam_160x120.png" ;
let img_error = "imatges/webcam/bio_hazard.png" ;

// let myid_imatge = document.getElementById('id_imatge')

// +++ funcions

// nova funcio yymmdd de Date() - at client
Date.prototype.yyyymmdd = function () {                            
	var yyyy = this.getFullYear().toString() ;                                    
	var mm   = (this.getMonth()+1).toString() ; // getMonth() is zero-based         
	var dd   = this.getDate().toString() ;
	return yyyy + '/' + (mm[1]?mm:"0"+mm[0]) + '/' + (dd[1]?dd:"0"+dd[0]) ;
} ; // yyyymmd

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
} ; // hhmmss

// get a timestamp
function genTimeStamp ( arg ) {

    var szOut = (new Date).yyyymmdd() + ' - ' + (new Date).hhmmss() ;
    return szOut ;

} ; // genTimeStamp()


// === que fem quan es pica el link de "fer foto" :
$( ".clkFerFoto" ).click( function() {
    $.get( '/fem_foto', function( page ) {
        console.log( '*** [' + genTimeStamp() + '] index - rebem del server la sub-pagina FER_FOTO' ) ;
        $( "#id_photo" ).html( page ) ; // show received HTML at specific <div>
    } ) ; // get(/fem_foto)
}) ; // clkFerFoto

// === que fem quan es pica el link de "foto seq" : *** obsolete ***
$( ".clkFotoSeq" ).click( function() {
    $.get( '/foto_seq.html', function( page ) {
        console.log( '*** [' + genTimeStamp() + '] index - rebem del server la sub-pagina FOTO_SEQ' ) ;
        $( "#id_photo" ).html( page ) ; // show received HTML at specific <div>
    } ) ; // get(foto_seq)
}) ; // clkFotoSeq


function MyTimeout( ) {
var szLog ;

    szLog = '*** [' + genTimeStamp() + '] event : MyTimeout (' + kSeconds + ') sec, id (' + myTimer + '). ' ;
    szLog += 'Busy (' + timBusy + ') - request JSON' ;
    console.log( szLog ) ;
    // pendent : mirar timBusy
    timBusy = 1 ;

    $.getJSON( '/fes_photo_gimme_json', function( mi_json ) {

        cntPics = cntPics + 1 ;
        szLog = '+++ [' + genTimeStamp() + '] rebem JSON : q(' + mi_json.status + '), url (' + mi_json.imgURL + '). ' ;
        szLog += 'Cnt (' + cntPics + '). ' ;
        szLog += 'Idx (' + idxPics + ') / (' + maxPics + '). ' ;
        console.log( szLog ) ;

        var szIdPutPic = '#idn_imatge_'+idxPics ;                                  // calculem el nom del lloc on posar la seguent imatge
        console.log( ">>> sequencia imatges - ocupem posicio (%s).", szIdPutPic ) ;

        if ( mi_json.status == "OK" ) {

            let randomStr = Math.random().toString(36).substr(2) ;                     // avoid html 304
            $( szIdPutPic ).attr( 'src', mi_json.imgURL+ '?random=' + randomStr ) ;    // request pic file and place it in page

        } else {

            var szError = genTimeStamp() + ' Error RxJSON ' + mi_json.status ;
            console.log( "--- (%s).", szError ) ;
            $( "#id_estat" ).html(szError) ; // show error message at specific <div>

            $( szIdPutPic ).attr( 'src', img_error ) ;                            // request "empty" pic and place it in page
        } ; 

        timBusy = 0 ;

// lets timestamp the picture :

        var szIdPicDate = '#idn_tmstmp_'+idxPics ;                                  // calculem el nom del lloc on posar el seguent texte
        var szThisMoment = genTimeStamp() ;
        console.log( ">>> sequencia imatges - marquem posicio (%s) amb (%s).", szIdPicDate, szThisMoment ) ;
        $( szIdPicDate ).html( szThisMoment ) ;                                     // write timestamp in cell

// lets work with "next" item

        idxPics = idxPics + 1 ;
        if ( idxPics === maxPics ) { idxPics = 0 ; } ;

        var szIdClrPic = '#idn_imatge_'+idxPics ;                                   // calculem el nom del lloc on esborrar la imatge
        $( szIdClrPic ).attr( 'src', img_buida ) ;                                  // request "empty" pic and place it in page

        var szIdClrDate = '#idn_tmstmp_'+idxPics ;                                  // calculem el nom del lloc on posar el seguent texte
        $( szIdClrDate ).html( '- - -' ) ;                                          // write "empty" timestamp in cell

    }) ; // getJSON()

} ; // MyTimeout( )


$( ".clkStartFotoSeq" ).click( function() {
//     myTimer = setInterval(_ => { MyTimeout() ; }, 1000 * kSeconds) ;
    myTimer = setInterval( MyTimeout, 1000 * kSeconds) ;
    console.log( '*** [' + genTimeStamp() + '] click Start Timer' + ', id ' + myTimer + ', timeout (' + kSeconds + ') segons.' ) ;
    var szOp='/send_status_to_client/opid=start_timeout&opto='+kSeconds ;
    $.post( szOp, function( page ) {
        console.log( '*** [' + genTimeStamp() + '] index - rebem del server status Start Photo Sequence, Start Timeout' ) ;
        $( "#id_estat" ).html( page ) ; // show received HTML at specific <div>
    } ) ; // get(/send_status_to_client/opid=start_timeout)
} ) ; // clkStartFotoSeq

$( ".clkStopFotoSeq" ).click( function() {
    console.log( '*** [' + genTimeStamp() + '] click Stop Timer' + ', id ' + myTimer ) ;
    clearInterval(myTimer) ;
    var szOp='/send_status_to_client/opid=stop_sequence&opto=0' ;
    $.post( szOp, function( page ) {
        console.log( '*** [' + genTimeStamp() + '] index - rebem del server status Stop Photo Sequence' ) ;
        $( "#id_estat" ).html( page ) ; // show received HTML at specific <div>
    } ) ; // get(/send_status_to_client/opid=stop_sequence)
} ) ; // clkStopFotoSeq

// ===

function index_ready() {              // DOM ready for index.htm

    console.log( '*** (' + genTimeStamp() + ') *** index DOM ready.' ) ;

// posar la data actual a dalt al mig - aixi diferenciem re-loads
    var szAra = '<center>./public/index.html - page loaded at [' + genTimeStamp() + ']</center>' ;
    $( "#id_date" ).html( szAra ) ; // show actual date

    $.get( '/gimme_ID', function( page ) {
        console.log( '*** [' + genTimeStamp() + '] get(/gimme_ID)' ) ;
        $( "#id_estat" ).html( page ) ; // show received HTML at specific <div>
    }) ; // get()

} ; // index_ready(), DOM ready for INDEX.HTM


$( function() {
	
    index_ready() ; // DOM ready event
  
} ) ; // DOM ready
