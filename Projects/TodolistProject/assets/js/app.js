// Check Off Specific Todos by clicking
$('ul').on("click","li",(function(){
   $(this).toggleClass('clicked');
}));

// Click on X to delete To-do
$('ul').on("click","span",(function(event){
   $(this).parent().fadeOut(500,function(){
       $(this).remove();
   });
   event.stopPropagation(); // Stops from triggering parent events
}));

$('input[type="text"]').keypress(function(event){
    if(event.which=== 13) // Enter Key is 13
    {
        var todo_in = $(this).val(); // Gets text from input
        $(this).val("");
        $('ul').append("<li><span><i class=\"fas fa-trash-alt\"></i></span> "+todo_in+"</li>");
    }
});

$('h1 span').click(function(){
   $('input[type="text"]').fadeToggle(500);
});