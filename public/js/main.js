$(function(){
    if($('textarea#ta').length){
        CKEDITOR.replace('ta')
    }

    $('a#play').on('click', function(){
        if(!confirm('Confirm Deletion!')) 
            return false
    })
})