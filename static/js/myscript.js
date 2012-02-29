jQuery(function(){
    var zeroPad = function (num, places) {
            var zero = places - num.toString().length + 1;
            return Array(+(zero > 0 && zero)).join("0") + num;
        }
    a=bravura('#container', {}, {
        'dateformatter': function(input) {
            mydate = new Date();
            mydate.setTime(input*1000);
            return zeroPad(mydate.getHours(),2) + ':' + zeroPad(mydate.getMinutes(),2);
        }
    });
    a.start();
});
