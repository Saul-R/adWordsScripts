function main() {
  
  //Change for the url you want to change
  var urlToChange = "http://www.melia.com/en/hotels/spain/valladolid/melia-recoletos-boutique-hotel/index.html";
  
  
 
  
  var cgnID = 88; // country code CGNIDs: 88 UK, 89 SC, 90 SW, 91 BNX
  var urlBase = "http://1029.netrk.net/click?cgnid="+cgnID+"&prid=184&target=";
  
  var newUrl = urlBase + encodeURIComponent(urlToChange);
  Logger.log("Url original: "+urlToChange+" cambiar a:\n");
  Logger.log(newUrl );
 }
