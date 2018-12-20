var colors = generatecolors(6);

var squares = document.querySelectorAll(".square");
var exsquares = document.querySelectorAll(".extremesquare");

var pickedColor = colors[pickColor()];
var rgbdisplay = document.querySelector("#rgbdisplay");
var messagedisplay = document.querySelector("#message");
var headerdisplay = document.querySelector(".headergame");
var newcolorsbutt = document.querySelector("#NewColors");
var default_color = "#232323";
var temp_color = 0;
var easybutton = document.querySelector("#easy");
var hardbutton = document.querySelector("#hard");
var extrahardbutton = document.querySelector("#extrahard");
var mode = "hard";

easybutton.addEventListener("click",function(){
    if (mode!="easy")
    {
        mode = "easy";
        easybutton.classList.add('selected');
        hardbutton.classList.remove('selected');
        extrahardbutton.classList.remove('selected');
        colors = generatecolors(3);
        pickedColor = colors[pickColor()];
        rgbdisplay.textContent = pickedColor;
        for (var i=0;i<squares.length;i++)
        {
            if(colors[i])
            {
                squares[i].style.backgroundColor = colors[i];
            }
            else
            {
                squares[i].style.display = "None";
            }
        }
    }
    
});

hardbutton.addEventListener("click",function(){
    if (mode!="hard")
    {
        mode = "hard";
        easybutton.classList.remove('selected');
        hardbutton.classList.add('selected');
        extrahardbutton.classList.remove('selected');
        colors = generatecolors(6);
        pickedColor = colors[pickColor()];
        rgbdisplay.textContent = pickedColor;
        for (var i=0;i<squares.length;i++)
        {
            if(colors[i])
            {
                squares[i].style.backgroundColor = colors[i];
                squares[i].style.display = "block";
            }
            else
            {
                squares[i].style.display = "None";
            }
        } 
    }
});

extrahardbutton.addEventListener("click",function(){
    if (mode!="extrahard")
    {
        mode = "extrahard";
        easybutton.classList.remove('selected');
        hardbutton.classList.remove('selected');
        extrahardbutton.classList.add('selected');
        colors = generatecolors(9);
        pickedColor = colors[pickColor()];
        rgbdisplay.textContent = pickedColor;
        for (var i=0;i<squares.length;i++)
        {
            squares[i].style.backgroundColor = colors[i];
            squares[i].style.display = "block";
        }
    }
});

rgbdisplay.textContent = pickedColor;
newcolorsbutt.addEventListener("click",function(){
   if (mode=="hard")
    {
        reset_all(6);
    }
    else if (mode=="easy")
    {
        reset_all(3);
    }
    else
    {
        reset_all(9);
    }
});

for(var i=0;i<squares.length;i++)
{
    // Add initial colors
    if(colors[i])
    {
        squares[i].style.backgroundColor = colors[i];
        squares[i].style.display = "block";
    }
    // Add click listeners
    squares[i].addEventListener("click",function() {
        var clickedcolor = this.style.backgroundColor;
        if (clickedcolor===pickedColor)
        {
            // console.log("Correct");
            messagedisplay.textContent = "Correct";
            changecolors(pickedColor);
            newcolorsbutt.textContent = "Play Again?";
        }
        else
        {
            // console.log("Incorrect");
            messagedisplay.textContent = "Try Again";
            this.style.backgroundColor = "#232323";
        }
    });

}

function changecolors(color)
{
    for(var i=0;i<squares.length;i++)
    {
        squares[i].style.backgroundColor = color;
    }
    headerdisplay.style.backgroundColor = color;
}

function pickColor()
{
    return Math.floor(Math.random()*colors.length);
}

function generatecolors(num)
{
    var i;
    var arr = [];
    for (i=0;i<num;i++)
    {
        arr.push(randomColor());
    }

    return arr;
}

function randomColor()
{
    var r_color = Math.floor(Math.random()*256);
    var g_color = Math.floor(Math.random()*256);
    var b_color = Math.floor(Math.random()*256);
    return "rgb(" + r_color + ", " + g_color + ", " + b_color + ")";
}

function reset_all(num)
{
    colors = generatecolors(num);
    for(var i=0;i<colors.length;i++)
    {
        squares[i].style.backgroundColor = colors[i];
    }
    temp_color = pickColor();
    pickedColor = colors[temp_color];
    rgbdisplay.textContent = pickedColor;
    headerdisplay.style.backgroundColor = "steelblue";
    newcolorsbutt.textContent = "New Colors";
    messagedisplay.textContent = "Pick a Color";
}