/*jslint browser: true, eqeq: true, plusplus: true, sloppy: true, indent: 4, vars: true */
/*global finishedLoading, currentFrame, preloadFrame, preloadOneFrame: false */
/*
 * based on http://pastebin.com/cWxA6EDR
 * No idea who to give credit to, but thanks.
 */

var c1 = document.getElementById("canvas1");
var ctx1 = c1.getContext("2d");

var c2 = document.getElementById("canvas2");
var ctx2 = c2.getContext("2d");

var c3 = document.getElementById("canvas3");
var ctx3 = c3.getContext("2d");

var img1loaded = false;
var img2loaded = false;
var diff_algo = 'invsquare_dark';

function drawDiffImage() {
    var i, n;
    var data1 = ctx1.getImageData(0, 0, c1.width, c1.height).data;
    var data2 = ctx2.getImageData(0, 0, c2.width, c2.height).data;

    var imageData = ctx3.createImageData(c3.width, c3.height); //So context is not tainted by cross origin ...
    var data3 = imageData.data;

    for (i = 0, n = data1.length; i < n; i += 4) {
        var x = (i % (c1.width*4))/4
        var y = i / (c1.width*4);

        //diffpx = getDiff(diff_algo, (x/c1.width)*0xFF, (y/c1.height)*0xFF);
        diffpx = getDiff(diff_algo, data2[i], data1[i]);
        for(j=0; j < 4; j++) {
            data3[i+j] = Math.floor(diffpx[j]);
        }
    }

    ctx3.putImageData(imageData, 0, 0);
    finishedLoading();
}

function getDiff(algo, color1, color2) {
    var bkgnd = 0x00, scale = 1.0, diff_color_val = 0xFF;
    var retpx = [];
    var maxval = Math.max(color1, color2);
    switch(algo) {
        case 'linear_dark': //linear, color
            scale = 1;
            bkgnd = 0xFF - Math.abs(color1 - color2);
            diff_color_val = 0xFF;
            break;
        case 'linear':
            scale = maxval / 0xFF;
            bkgnd = 0xFF - Math.abs(color1 - color2);
            diff_color_val = 0xFF;
            break;
        case 'invsquare_dark':
            scale = maxval / 0xFF;
            bkgnd = 0xFF * (1 - Math.sqrt(Math.abs(color1 - color2)/0xFF));
            diff_color_val = maxval;
            break;
        case 'invsquare':
            scale = 1;
            bkgnd = 0xFF * (1 - Math.sqrt(Math.abs(color1 - color2)/0xFF));
            diff_color_val = 0xFF;
            break;
        case 'mono': //original
        default:
            break;
    }

    retpx[0] = color1 == color2 ? color1 : (color1 < color2 ? diff_color_val : bkgnd * scale );
    retpx[1] = color1 == color2 ? color1 : (color1 > color2 ? diff_color_val : bkgnd * scale );
    retpx[2] = color1 == color2 ? color1 : bkgnd * scale;
    retpx[3] = 0xFF;

    return retpx;
}


var compareFrame;
function image2preloaded(frame, img) {
    if (compareFrame == frame) {
        ctx2.drawImage(img, 0, 0);
        img2loaded = true;
        if (img1loaded) {
            finishedLoading();
            drawDiffImage();
        }
    }
}
function image1preloaded(frame, img) {
    if (currentFrame == frame) {
        ctx1.drawImage(img, 0, 0);
        img1loaded = true;
        if (img2loaded) {
            finishedLoading();
            drawDiffImage();
        }
    }
}


/*
 * Difference between two frames, if frame parameter not provided is shows difference from previous frame.
 */
function diff(frame) {
    img1loaded = false;
    img2loaded = false;
    if (!frame) {
        compareFrame = currentFrame - 1;
    } else {
        compareFrame = frame;
    }

    if (compareFrame < 1) {
        img2loaded = true;
        ctx2.fillStyle = "white";
        ctx2.fillRect(0, 0, c2.width, c2.height);
    } else {
        preloadOneFrame(compareFrame, image2preloaded, false);
    }

    preloadFrame(currentFrame, image1preloaded, false);
}













