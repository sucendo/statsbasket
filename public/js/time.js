/**
 * crono.js v1.0.0
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2016, Sucendo
 * http://www.sucendo.com
 */
 
            function padNmb(nStr, nLen){
            var sRes = String(nStr);
            var sCeros = "0000000000";
            return sCeros.substr(0, nLen - sRes.length) + sRes;
            }
        
           function stringToSeconds(tiempo){
            var sep1 = tiempo.indexOf(":");
            var sep2 = tiempo.lastIndexOf(":");
            var hor = tiempo.substr(0, sep1);
            var min = tiempo.substr(sep1 + 1, sep2 - sep1 - 1);
            var sec = tiempo.substr(sep2 + 1);
            return (Number(sec) + (Number(min) * 60) + (Number(hor) * 3600));
           }
        
           function secondsToTime(secs){
            var hor = Math.floor(secs / 3600);
            var min = Math.floor((secs - (hor * 3600)) / 60);
            var sec = secs - (hor * 3600) - (min * 60);
            return padNmb(hor, 2) + ":" + padNmb(min, 2) + ":" + padNmb(sec, 2);
           }
           
        
           function substractTimes(t1, t2){
            var secs1 = stringToSeconds(t1);
            var secs2 = stringToSeconds(t2);
            var secsDif = secs1 - secs2;
            return secondsToTime(secsDif);
           }
           
           function substractTimes2(t1, t2){
            var secs1 = stringToSeconds(t1);
            var secs2 = stringToSeconds(t2);
            var secsDif = secs1 + secs2;
            return secondsToTime(secsDif);
           }
           
           function substractTimes3(t1, t2){
            var secs1 = stringToSeconds(t1);
            var secs2 = t2;
            var secsDif = secs1 / secs2;
            return secondsToTime(secsDif);
           }
        
           function calcResT(t1,t2){
             t3 = substractTimes(t1,t2);
             return t3;
           }
           function calcSumT(t1,t2){
             t3 = substractTimes2(t1,t2);
             return t3;
           }  
           function calcDivT(t1,t2){
             t3 = substractTimes3(t1,t2);
             return t3;
           } 
           
           