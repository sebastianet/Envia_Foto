
// nova funcio yymmdd de Date() - at client
Date.prototype.yyyymmdd = function () {                            
	var yyyy = this.getFullYear().toString();                                    
	var mm   = (this.getMonth()+1).toString(); // getMonth() is zero-based         
	var dd   = this.getDate().toString();
	return yyyy + '/' + (mm[1]?mm:"0"+mm[0]) + '/' + (dd[1]?dd:"0"+dd[0]);
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

// === que fem quan es pica el link de "fer foto" :

$( ".clkFerFoto" ).click( function() {
    $.get( '/fem_foto', function( page ) {
        console.log( '*** [' + (new Date).yyyymmdd() +', '+ (new Date).hhmmss() + '] index - demanem al server la sub-pagina FER_FOTO' ) ;
        $( "#id_photo" ).html( page ) ; // show received HTML at specific <div>
    }) ; // get()
}) ; // clkFerFoto

// ===

function index_ready() {              // DOM ready for index.htm

    console.log( '*** index DOM ready.' ) ;

// posar la data actual a dalt al mig - aixi diferenciem re-loads
    var szAra = '<center>./public/index.html - now is [' + (new Date).yyyymmdd() +', '+ (new Date).hhmmss() + ']</center>' ;
    $( "#id_date" ).html( szAra ) ; // show actual date

} ; // index_ready(), DOM ready for INDEX.HTM


$( function() {
	
    index_ready(); // DOM ready event
  
} ) ; // DOM ready
