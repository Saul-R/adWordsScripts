




//Just use the name of the promo (and your email address!), what you put between brackets, and then hit run script now (that blue button below the code)


PROMO_NAME = "foobar";

MAIL_FOR_FAIL = "saul.r@dotcomrepublic.com";

//Check Logs for warnings on names. Whatch out for accents, mispellings and missing fields!









































//To do: put all the missing campaigns in a csv and send it in just one mail. Also Display message if everything was ok











//Version 1.2
// __          _ 
//(_  _     | |_)
//__)(_||_| | | \
//

function main() {
    Logger.log('CampaignName CONTAINS_IGNORE_CASE "' + PROMO_NAME + '"');
    var adGroups = AdWordsApp
		.adGroups()
		.withCondition('CampaignName CONTAINS_IGNORE_CASE "' + PROMO_NAME + '"')
        .withCondition("Status = ENABLED")
		.get();  
    Logger.log(adGroups.totalNumEntities());
    Logger.log("Pausing the promo: " + PROMO_NAME); 
    var chachiPistachi = true;
	while (adGroups.hasNext()){
      var adGroup = adGroups.next();
      var campaignName = adGroup.getCampaign().getName();
      var language = campaignName.replace(/^(.*)((UK)|(EN)|(GE)|(FR)|(IT))(.*)$/,"$2");
      //Logger.log(language);
      var keywords = adGroup.keywords().get();
       //pause campaign and restore original
       //Logger.log("Pausing the promo: " + PROMO_NAME);
       //MailApp.sendEmail("saul.r@dotcomrepublic.com","End of"+ PROMO_NAME, "Check everything has been properly paused");
       var campaign = adGroup.getCampaign();
       campaign.pause();
       var originalName = campaign.getName();
       originalName = originalName.replace(" ("+ PROMO_NAME +")","");
       //Logger.log("Enabling original campaign:"+originalName);
       var originalCampaignIt = AdWordsApp.campaigns().withCondition('Name = "' + originalName + '"').get();
        if (originalCampaignIt.hasNext()){
          var originalCampaign = originalCampaignIt.next();
          //Logger.log("Name Of the Campaign: "+originalCampaign.getName())
          originalCampaign.enable();
        }
        else{
          //throw new Exception("The campaign "+ originalName +" wasn't found on the account");
          //MailApp.sendEmail("saul.r@dotcomrepublic.com","The campaign "+ originalName +" wasn't found on the account","The promo " + PROMO_NAME + "Has Problems with the campaign "+ originalName);
          if (chachiPistachi){
            chachiPistachi=false;
          }
          Logger.log("WARNING: The campaign "+ originalName +" wasn't found on the account","The promo " + PROMO_NAME + "Has Problems with the campaign "+ originalName)
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
//Send mail or confirmation of everything was chachi  
  if (chachiPistachi){
    Logger.log("Everything went:");
    Logger.log("  #####                                   ######                                        \n #     # #    #   ##    ####  #    # #    #     # #  ####  #####   ##    ####  #    # # \n #       #    #  #  #  #    # #    # #    #     # # #        #    #  #  #    # #    # # \n #       ###### #    # #      ###### #    ######  #  ####    #   #    # #      ###### # \n #       #    # ###### #      #    # #    #       #      #   #   ###### #      #    # # \n #     # #    # #    # #    # #    # #    #       # #    #   #   #    # #    # #    # # \n  #####  #    # #    #  ####  #    # #    #       #  ####    #   #    #  ####  #    # # ");
    }
  else{
    MailApp.sendEmail(MAIL_FOR_FAIL,"The script failed, check Log, Example campaign: "+ PROMO_NAME);  }
}
