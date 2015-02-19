///Unique part of each script.

var END_DATE = new Date('12 Feb, 2015 00:00:00'); // format: ("01 June, 2014 23:15:00")
var PROMO_NAME = 'Early Booking 2015'; 

var  COUNTDOWN = 0; //use the 1 to opt in for the countdown copies 
//Ver 5.3 - 17/12/2014


var COPY_PARAMETER_EN = 'Hurry up, Offer Ends in {param1: 5} days.';

//Hurry up, Offer Ends in 14 days

//var AD_COPY = 'Offer expires on';
//var LAST_DAY_COPY = 'Last Chance. Offer Ends Today.'; //params cannot contain spaces!Why!!!!?????
//REMEMBER TO SET PARAMS ON THE AD COPIES: {param1:AltText} ----> NOW FIX ;) 
// /To do: One script fits all, end date and promo managed with labels,
// \ not with a filthy static value
//////////////////////////////////////////////////////////////////
//            BONUS: The final countdown lyrics               ///
////////////////////////////////////////////////////////////////
//We're leaving together,                                   ///
//But still it's farewell                                   ///
//And maybe we'll come back,                                ///
//To earth, who can tell ?                                  ///
//I guess there is no one to blame                          ///
//We're leaving ground                                      ///
//Will things ever be the same again?                       ///
//                                                          ///
//It's the final countdown...                               ///
//                                                          ///
//We're heading for Venus and still we stand tall           ///
//Cause maybe they've seen us and welcome us all            ///
//With so many light years to go and things to be found     ///
//I'm sure that we'll all miss her so.                      ///
///////////////////////////////////////////////////////////////

var DAY_IN_MILLISECONDS = 1000*60*60*24;



function main() {
	var timeLeft = calculateTimeLeftUntil(END_DATE);
    Aux_PROMO_NAME = "("+PROMO_NAME+")";
    Logger.log('CampaignName CONTAINS_IGNORE_CASE "' + Aux_PROMO_NAME + '"');
    var adGroups = AdWordsApp
		.adGroups()
		.withCondition('CampaignName CONTAINS_IGNORE_CASE "' + Aux_PROMO_NAME + '"')
		.withCondition('CampaignStatus = ENABLED')
        .get();
  
    var headline = "";
    var descLine2 = "";
    var displayURL = "";
    var destinationURL = "";
    var descLine1 = {}
    var descLine1alt = {};
  
    descLine1['EN'] = "Last Chance. Offer ends today.";
    descLine1['UK'] = descLine1['EN'];
    descLine1['FR'] = "L'offre finit aujourd'hui.";
    descLine1['GE'] = "Letzte Chance. Angebot endet Heute";
    descLine1['IT'] = "La grande offerta scade oggi";
    descLine1alt['EN'] = "Last Chance. Offer ends tomorrow.";
    descLine1alt['FR'] = "L'offre finit demain, Dépêchez-vous";
    descLine1alt['GE'] = "Letzte Chance. Angebot endet Morgen";
    descLine1alt['IT'] = "La grande offerta scade domani.";
    descLine1alt['UK'] = descLine1alt['EN'];
  
    var fails = "";   
    Logger.log(adGroups.totalNumEntities());
	while (adGroups.hasNext()){
      var adGroup = adGroups.next();
      var campaignName = adGroup.getCampaign().getName();
      var language = campaignName.replace(/^(.*)((UK)|(EN)|(GE)|(FR)|(IT))(.*)$/,"$2");
      //Logger.log(language);
      var keywords = adGroup.keywords().get();
      //Logger.log(timeLeft['days']);
      
      if(timeLeft['days']==1 && COUNTDOWN == 1){ //last day
         Logger.log("Last Day");
        iteratorAds = adGroup.ads().withCondition("Status = ENABLED").get();
        while (iteratorAds.hasNext()){
          adNow = iteratorAds.next();
          adNow.pause();
          descLine2 = adNow.getDescription2();
          headline = adNow.getHeadline();
          displayURL = adNow.getDisplayUrl();
          destinationURL = adNow.getDestinationUrl();
        }//pauses every ad and retrieves the details of every ad (but only the last one's remains)
        adGroup.createTextAd(
        headline, descLine1[language], descLine2, displayURL, destinationURL);
      }
      
      if (timeLeft['days']==2 && COUNTDOWN == 1){
        Logger.log("1 day left");
          iteratorAds = adGroup.ads().get();
        var maxCtr = -1;
        while (iteratorAds.hasNext()){
          adNow = iteratorAds.next();
          adNow.pause();
          if (adNow.getStatsFor("LAST_MONTH").getCtr()>maxCtr){
            descLine2 = adNow.getDescription2();
            headline = adNow.getHeadline();
            displayURL = adNow.getDisplayUrl();
            destinationURL = adNow.getDestinationUrl();
            maxCtr = adNow.getStatsFor("LAST_MONTH").getCtr();
          }
        }//pauses every ad and gets the details of the best performer
        adGroup.createTextAd(
          headline, descLine1alt[language], descLine2, displayURL, destinationURL);
      }
      
      if(timeLeft['days']<1){
       //pause campaign and restore original
        
       //Logger.log("Pausing the promo: " + PROMO_NAME);
      
       //MailApp.sendEmail("saul.r@dotcomrepublic.com","End of"+ PROMO_NAME, "Check everything has been properly paused");
       var campaign = adGroup.getCampaign();
       campaign.pause();
       var originalName = campaign.getName();
       originalName = originalName.replace(" ("+ PROMO_NAME +")","");
       //Logger.log("Enabling original campaign:"+originalName);
       var originalCampaignIt = AdWordsApp.campaigns().withCondition('Name = "' + originalName + '"').get();
        if (originalCampaignIt.totalNumEntities()==0){
          fails=fails+", "+originalName;
        }
        if (originalCampaignIt.hasNext()){
          var originalCampaign = originalCampaignIt.next();
          //Logger.log("Name Of the Campaign: "+originalCampaign.getName())
          originalCampaign.enable();
        }
        else{
          //throw new Exception("The campaign "+ originalName +" wasn't found on the account");
          //MailApp.sendEmail("saul.r@dotcomrepublic.com","The campaign "+ originalName +" wasn't found on the account","The promo " + PROMO_NAME + "Has Problems with the campaign "+ originalName);
          Logger.log("WARNING: The campaign "+ originalName +" wasn't found on the account","The promo " + PROMO_NAME + "Has Problems with the campaign "+ originalName);
          campaign.enable();
          var adReanimator = campaign.ads().get();
          while (adReanimator.hasNext()){
            var actual = adReanimator.next();
            if (actual.getDescription2().indexOf("{param1", 0)<0){
              actual.enable();
            }
            else
            {
              actual.pause();              
            }
          }
        } 
      }
      
      else if(COUNTDOWN == 1){ //normal days from start of the script to the 2 days to go
		iteratorAds = adGroup.ads().withCondition("Status = ENABLED").get();
		var hasTheAd = false;
		while(iteratorAds.hasNext()){ //create the parametrized ad if it doesn't exists
			var adNow = iteratorAds.next();
			descLine2 = adNow.getDescription2();
			descLine1 = adNow.getDescription1();
            if((descLine1.indexOf("{param1", 0)>-1)||(descLine2.indexOf("{param1", 0)>-1)){ //("{param1")||descLine2.conatins("{param1")){
				hasTheAd = true;
            }
            //add best CTR thing
        }
        if (!hasTheAd){
			descLine2 = COPY_PARAMETER_EN;
			descLine1 = adNow.getDescription1();
			headline = adNow.getHeadline();
			displayURL = adNow.getDisplayUrl();
			destinationURL = adNow.getDestinationUrl();
			adGroup.createTextAd(
				headline, descLine1, descLine2, displayURL, destinationURL);
            Logger.log(adNow.getCampaign().getName()+ " created ad because hasad its "+ hasTheAd);
            Logger.log(headline+"\n"+ descLine1+"\n"+descLine2+"\n"+displayURL+"\n"+destinationURL)
		}
		
		while (keywords.hasNext()) {	//manage the parameters
            var keyword = keywords.next();
            keyword.setAdParam(1, timeLeft['days']);
		}
      }
	}
  if(timeLeft['days']<1){
    MailApp.sendEmail("saul.r@dotcomrepublic.com","End of"+ PROMO_NAME, "Check fails: "+fails);
  }
}

function calculateTimeLeftUntil(end) {
    
    Logger.log(end);
    var current = new Date();
    //current.setHours(current.getHours+8);
    Logger.log(current);
    
  
	var timeLeft = {};
	var daysFloat = (end - current-(8*1000*60*60))/(DAY_IN_MILLISECONDS); // The time is returned in GMT -8 ??? WTF setHour doesn't work properly. Just Substracting 8 hours in Miliseconds
    Logger.log("Days Left");
    Logger.log(daysFloat);
	timeLeft['days'] = Math.floor(daysFloat)+1;
    Logger.log(timeLeft['days']);
	timeLeft['hours'] = Math.floor(24 * (daysFloat - timeLeft['days']));
	return timeLeft;
}

//not necessary anymore 
function getAdGroup(name) {
	var adGroupIterator = AdWordsApp.adGroups()
	.withCondition('Name CONTAINS_IGNORE_CASE "' + name + '"')
	.withLimit(1)
	.get();
	if (adGroupIterator.hasNext()) {
		return adGroupIterator.next();
	}
}
