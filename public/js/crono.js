/**
 * crono.js v1.0.0
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2016, Sucendo
 * http://www.sucendo.com
 */
 
 /*Time variable recording the number of milliseconds past since start of the chrono */
    var numberms=0;
            
    /* setInterval method ID*/
    var runningChronoInterval;
            
    /* boolean checking if loop is running */
    var isChronoRunning=false;
    
    var thePlay = document.getElementById( 'play' ); /*sucendo*/
            
    /* Initialization: set the number of milliseconds to 0 and display on screen */
    function init() {
        numberms = 0;
        formatAndDisplay(numberms);
        formatAndDisplayDown(numberms);
    }
            
    /*  Starting our loop [including storing ID] 
        In the 'loop' : incrementing our time variable and asking for display on screen
             
        intervalms: number of milliseconds indenting the chrono  */
    function start(intervalms) {
        //Checking we do not have already one loop running
        if (!isChronoRunning) {
            isChronoRunning=true;
            classie.removeClass( thePlay, 'icon-play3' );
            classie.addClass( thePlay, 'icon-pause2' );
            runningChronoInterval = setInterval(function() {
                numberms += intervalms;
                formatAndDisplay(numberms);
                formatAndDisplayDown(numberms); //sucendo
            }, intervalms);
        }else{
            stop();
        }
    }
            
    /* Stopping our loop*/
    function stop() {
        clearInterval(runningChronoInterval);
        isChronoRunning=false;
        classie.removeClass( thePlay, 'icon-pause2' );
        classie.addClass( thePlay, 'icon-play3' );
    }
            
    /* Resetting: stopping the loop and inilization of data */
    function reset() {
        if (!isChronoRunning) {
            stop();
            init();
        }
    }
            
    /* Format the number of milliseconds as desired and displaying on screen */
    function formatAndDisplay(numberOfMs) {
                
        //24 hours already past, rather than adding another modulus calculation (as we do not display days), set time to 0
        if (numberOfMs==86400000){ //8640000 = 24 * 60 * 60 * 1000
                    numberOfMs=0;
        }
                
        var nbrHours=Math.floor(numberOfMs/3600000); //3600000 = 1 hour
        var nbrMin=Math.floor((numberOfMs-nbrHours*3600000)/60000); // Take off the hours to get the minutes
        var nbrSec=Math.floor((numberOfMs-nbrHours*3600000-nbrMin*60000)/1000); //// Take off the hours and minutes to and get the seconds
                
        var timeRepresentation=doubleDigit(nbrMin) + ':' + doubleDigit(nbrSec);
        //var timeRepresentation=doubleDigit(nbrHours) + ':' + doubleDigit(nbrMin) + ':' + doubleDigit(nbrSec);
                
        document.getElementById("chrono").innerHTML = timeRepresentation;
                
    }
    //isucendo
    function formatAndDisplayDown(numberOfMs) {
                
        //24 hours already past, rather than adding another modulus calculation (as we do not display days), set time to 0
        if (numberOfMs==86400000){ //8640000 = 24 * 60 * 60 * 1000
                    numberOfMs=0;
        }
        
        if (numberOfMs < 720000){ //12min
            numberOfMs = 720000 - numberOfMs;
        }else if (numberOfMs < (720000*2)){
            numberOfMs = (720000*2) - numberOfMs;
        }else if (numberOfMs < (720000*3)){    
            numberOfMs = (720000*3) - numberOfMs;
        }else{
            numberOfMs = (720000*4) - numberOfMs;
        }
        
        if (numberOfMs == 0) numberOfMs = 720000;
                
        var nbrHours=Math.floor(numberOfMs/3600000); //3600000 = 1 hour
        var nbrMin=Math.floor((numberOfMs-nbrHours*3600000)/60000); // Take off the hours to get the minutes
        var nbrSec=Math.floor((numberOfMs-nbrHours*3600000-nbrMin*60000)/1000); //// Take off the hours and minutes to and get the seconds
                
        var timeRepresentation=doubleDigit(nbrMin) + ':' + doubleDigit(nbrSec);
        //var timeRepresentation=doubleDigit(nbrHours) + ':' + doubleDigit(nbrMin) + ':' + doubleDigit(nbrSec);
                
        document.getElementById("chronoDown").innerHTML = timeRepresentation;
                
    }//fsucendo
            
    /* Helper function to build double digit numbers */
    function doubleDigit(nbr){
        return (nbr>9? nbr.toString():'0' + nbr.toString());
    }
            
    /* Initalization*/   
    init();
