function main() {
  var cgnID = 88; // country code
  var urlBase = "http://1029.netrk.net/click?cgnid="+cgnID+"&prid=184&target=";
  var urlActual = "";
  
  var allAds = AdWordsApp.ads()
  .withCondition("Status = ENABLED")
  .withCondition("CampaignStatus = ENABLED")
  .withCondition("AdGroupStatus = ENABLED")
  .get();
  
  while (allAds.hasNext()){
    adActual = allAds.next();
    urlActual=adActual.getDestinationUrl();
    if(urlActual.indexOf("http://1029.netrk.net/click?cgnid=", 0)!=0){
      var newUrl = urlBase + encodeURIComponent(urlActual);
      Logger.log("Changing url: "+urlActual+" to : "+newUrl );
    }
  }
  
  //Logger.log(urlBase);
  
  //send a mail if you detect something wrong in the urls
  //TODO
}
