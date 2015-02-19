function main() {
  var camp = AdWordsApp.campaigns()
  //.withCondition("Status = PAUSED")
  .withCondition("Name CONTAINS_IGNORE_CASE 'Me london'")//Change the name between '' on this line
  .get();
  
  Logger.log("Campaign\tCampaign ID")
  while (camp.hasNext()){
    var campaign = camp.next();
    Logger.log(campaign.getName()+"\t"+campaign.getId());
  }
}
