window.onload = function(){
    var canvas = document.getElementById("myCanvas");
    paper.setup(canvas);
    var keyData =
        {
            a: {
                color: "purple",
                sound: new Howl({
                    src: ['Assets/JS/lib/Sounds/A/bubbles.mp3','bubbles.mp3']})
                },
            s: {
                color: "red",
                sound: new Howl({
                    src: ['Assets/JS/lib/Sounds/A/clay.mp3','clay.mp3']})
            }
        }

    var sound = new Howl({
        src: ['Assets/JS/lib/Sounds/A/bubbles.mp3','bubbles.mp3']});

    var sound2 = new Howl({
        src: ['Assets/JS/lib/Sounds/A/bubbles.mp3','clay.mp3']});

    var circles = [];
    // var animatedCircle = new Path.Circle(new Point(300,300),100);
    // animatedCircle.fillColor = 'red';

    function onKeyDown(event) {
        if(keyData[event.key])
        {
            var Maxpoint = new Point(view.size.width, view.size.height);
            var randomPoint = Point.random();
            var point = Maxpoint*randomPoint;
            // When a key is pressed, set the content of the text item:
            var newCircle = new Path.Circle(point, 500);
            newCircle.fillColor = Color.random();
            newCircle.fillColor = keyData[event.key].color;
            keyData[event.key].sound.play();
            circles.push(newCircle);
        }
        var Maxpoint = new Point(view.size.width, view.size.height);
        var randomPoint = Point.random();
        var point = Maxpoint*randomPoint;
        // When a key is pressed, set the content of the text item:
        var newCircle = new Path.Circle(point, 500);
        newCircle.fillColor = Color.random();
        circles.push(newCircle);
    }

    function onFrame(event){
        for(var i=0;i<circles.length;i++)
        {
            circles[i].fillColor.hue+=1;
            circles[i].scale(0.90);
        }
    }
};