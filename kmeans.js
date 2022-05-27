var canvas = document.getElementById("IrisCanvas");
var ctx = canvas.getContext("2d");
              //Red     //Blue     //Green
var color = ["#FF0000", "#0000FF", "#00FF00"];
var accuracy = []; //vector used for the accuracy of the three centroids
var assignment = []; //vector to assign each centroid to it's class
var centroid_old = []; //vector to save the old proprietes of the centroids
var ndim = 3; //number of dimension that we would use for the program
function create() //function used to create the centroid and to spawn the point on the canvas
{
    var points = []; //array of points
    for (var i = 0; i < dataset.length; i++) 
    {
        points.push({ //pushing points into the array
            x: dataset[i].SepalLengthCm * 100 - 400, //coordinate adjustment to center points
            y: 600 - dataset[i].SepalWidthCm * 100 - 100,
            z: dataset[i].PetalLengthCm * 100 - 200,
            w: dataset[i].PetalWidthCm * 100 -100
        });
    }
    var distancei; //initial distance used to make sure that every centroid has at least 1 point associated
    var min = Infinity;
    var max = -Infinity;
    var xmin, xmax, ymin, ymax, zmax, zmin, wmax, wmin;
    for (var i = 0; i < dataset.length; i++) 
    {
        if(ndim == 4)//calculating distance from 0,0 to each point
        {
            distancei = Math.sqrt(Math.pow(points[i].x - 0, 2) + Math.pow(points[i].y - 0, 2) + Math.pow(points[i].z - 0, 2) + Math.pow(points[i].w - 0, 2) );
        }
        else if(ndim == 2)
        {
            distancei = Math.sqrt(Math.pow(points[i].x - 0, 2) + Math.pow(points[i].y - 0, 2));
        }
        else if(ndim == 3)
        {
            distancei = Math.sqrt(Math.pow(points[i].x - 0, 2) + Math.pow(points[i].y - 0, 2) + Math.pow(points[i].z - 0, 2));
        }
        else if(ndim == 1)
        {
            distancei = Math.sqrt(Math.pow(points[i].x - 0, 2));
        }

        if (distancei < min) //saving the closest and the farthest points
        {
            min = distancei;
            xmin = points[i].x;
            ymin = points[i].y;
            zmin = points[i].z;
            wmin = points[i].w;
        }

        if (distancei > max) 
        {
            max = distancei;
            xmax = points[i].x;
            ymax = points[i].y;
            zmax = points[i].z;
            wmax = points[i].w;
            
        }
    }

    var centroid = []; //array of centroids
    for (var i = 0; i < 3; i++) 
    {
        centroid.push({//pushing each centroid coordinate
            x: Math.random() * (xmax - xmin) + xmin,
            y: Math.random() * (ymax - ymin) + ymin,
            z: Math.random() * (zmax - zmin) + zmin,
            w: Math.random() * (wmax - wmin) + wmin
        });
    }
    return {
        points: points,
        centroid: centroid,
    };
}

function draw(points, centroid) //drawing points and centroids
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);//clearing the area
    for (var i = 0; i < points.length; i++) 
    {
        ctx.beginPath(); //drawing all the point with an initial black color
        ctx.arc(points[i].x, points[i].y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "black";
        ctx.fill();
    }
    ctx.beginPath(); //drawing the red centroid
    ctx.fillStyle = "red";
    ctx.arc(centroid[0].x, centroid[0].y, 8, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();//drawing the blue centroid
    ctx.fillStyle = "blue";
    ctx.arc(centroid[1].x, centroid[1].y, 8, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();//drawing the green centroid
    ctx.fillStyle = "green";
    ctx.arc(centroid[2].x, centroid[2].y, 8, 0, 2 * Math.PI);
    ctx.fill();
    //Assign the color of the cluster to the points associated with it
    for (var i = 0; i < points.length; i++) 
    {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = color[points[i].cluster];
        ctx.fill();
    }
}
function kmean_step(points, centroid) 
{
    //Assing points to their centroid using the distance equation
    for (var i = 0; i < points.length; i++) 
    {
        var min_dist = Infinity;
        var min_index = -1;
        for (var j = 0; j < centroid.length; j++) 
        {
            if(ndim == 4)
            {
                var dist = Math.sqrt(
                    Math.pow(points[i].x - centroid[j].x, 2) +
                    Math.pow(points[i].y - centroid[j].y, 2) +
                    Math.pow(points[i].z - centroid[j].z, 2) +
                    Math.pow(points[i].w - centroid[j].w, 2)
                );
            }
            else if (ndim == 2)
            {
                var dist = Math.sqrt(
                    Math.pow(points[i].x - centroid[j].x, 2) +
                    Math.pow(points[i].y - centroid[j].y, 2)
                );
            }
            else if(ndim == 3)
            {
                var dist = Math.sqrt(
                    Math.pow(points[i].x - centroid[j].x, 2) +
                    Math.pow(points[i].y - centroid[j].y, 2) +
                    Math.pow(points[i].z - centroid[j].z, 2) );
            }
            else if(ndim == 1)
            {
                var dist = Math.sqrt( Math.pow(points[i].x - centroid[j].x, 2));
            }

            if (dist < min_dist) //finding which centroid is closest to each point
            {
                min_dist = dist;
                min_index = j;
            }
        }
        points[i].cluster = min_index; //assign the each point it's cluster
    }

    centroid_old = JSON.parse(JSON.stringify(centroid));//converting and cloning the old centroid
    //updating centroids position
    for (var i = 0; i < centroid.length; i++) 
    {
        var sumx = 0;
        var sumy = 0;
        var sumz = 0;
        var sumw = 0;
        var count = 0;
        for (var j = 0; j < points.length; j++) 
        {
            if (points[j].cluster == i) //updating the coordinates making the average of them
            {
                sumx += points[j].x;
                sumy += points[j].y;
                sumz += points[j].z;
                sumw += points[j].w;
                count++;
            }
        }
        centroid[i].x = sumx / count;
        centroid[i].y = sumy / count;
        centroid[i].z = sumz / count;
        centroid[i].w = sumw / count;
        
    }

    if( checkCentroid(centroid_old, centroid) )
    {
        clearInterval(interval);//if the old position of each centroid is the same as the current centroids's position we stop to update them
        document.getElementById("commento").innerHTML= "L'algoritmo è terminato!";
        draw(points,centroid);
        
    }
    for(var i = 0 ; i < 3 ; i++)
    {
        var setosa = 0, versicolor = 0, virginica = 0;//counter of each species of the dataset
        for(var j = 0 ; j < dataset.length ; j++)
        {
            if(points[j].cluster == i)
            {
                if(dataset[j].Species == "Iris-setosa")
                    setosa++;
                else if(dataset[j].Species == "Iris-versicolor")
                    versicolor++;
                else
                    virginica++;
            }
        }
        if( setosa > virginica && setosa > versicolor )//assignment to each cluster of its own class and calculation of each class's accuracy
        {
            accuracy[i] = setosa / (setosa+versicolor+virginica);
            assignment[i] = "Setosa";
        }
        else if (virginica > setosa && virginica > versicolor)
        {
            accuracy[i] = virginica / (setosa+versicolor+virginica);
            assignment[i] = "Virginica";
        }
        else if(versicolor > setosa && versicolor > virginica)
        {
            accuracy[i] = versicolor / (setosa+versicolor+virginica);
            assignment[i] = "Versicolor";
        }
        
    }
    console.log("Accuracy  is " + (accuracy[0]+accuracy[1]+accuracy[2])/3 );
}

function checkCentroid(centroid_old , centroid)//check if old centroid is the same as the new
{
    for(var i = 0 ; i < 3 ; i++)
    {
        if( centroid_old[i].x == centroid[i].x && centroid_old[i].y == centroid[i].y && centroid_old[i].z == centroid[i].z && centroid_old[i].w == centroid[i].w)
        {
            continue;
        }
        else
        {
            return false;
        }
    }
    return true;
}

let { points, centroid } = create();

draw(points, centroid);

var interval = setInterval(() => { //definition of an interval to update the centroids until they've stopped to move
    kmean_step(points, centroid)
    setTimeout(() => {
        draw(points, centroid)
    }, 500)
}, 1)