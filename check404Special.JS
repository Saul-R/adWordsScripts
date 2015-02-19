function main() {
  // You can add more if you want: http://goo.gl/VhIX
  // Original Script by Russell Savage! modified by Saul-R
	
  var BAD_CODES = [404,500];
  var RED_CODES = [301,302,303,304,305,306,307,308];//not sure about 303 onwards
  var TO = ['alex.g@dotcomrepublic.com'];
  var SUBJECT = 'Broken Url Report - ' + _getDateString();
  var HTTP_OPTIONS = {
    muteHttpExceptions:true
  };
    
  //Let's look at ads and keywords for urls
  var iters = [
    //For Ad Level Urls
    AdWordsApp.ads()
      .withCondition("Status = 'ENABLED'")
      .withCondition("AdGroupStatus = 'ENABLED'")
      .withCondition("CampaignStatus = 'ENABLED'")
      .withCondition("Type = 'TEXT_AD'")
      .get(),
    //For Keyword Level Urls
    AdWordsApp.keywords()
      .withCondition("Status = 'ENABLED'")
      .withCondition("DestinationUrl != ''")
      .withCondition("AdGroupStatus = 'ENABLED'")
      .withCondition("CampaignStatus = 'ENABLED'")
      .get()
    ];
   
  var already_checked = {}; 
  var bad_entities = [];
  var red_entities = [];
  for(var x in iters) {
    var iter = iters[x];
    while(iter.hasNext()) {
      var entity = iter.next();
      if(entity.getDestinationUrl() == null) { continue; }
      var url = entity.getDestinationUrl();
      if(url.indexOf('{') >= 0) {
        //Let's remove the value track parameters
        url = url.replace(/\{[0-9a-zA-Z]+\}/g,'');
      }
      if(already_checked[url]) { continue; }
      var response_code;
      try {
        Logger.log("Testing url: "+url);
        response_code = UrlFetchApp.fetch(url, HTTP_OPTIONS).getResponseCode();
      } catch(e) {
        //Something is wrong here, we should know about it.
        //bad_entities.push({e : entity, code : -1});
        //entity.pause();  //THIS SHOULD PAUSE BAD LINKS
        
        Logger.log("Check this url:\n");
        Logger.log(url);
        
      }
      if(BAD_CODES.indexOf(response_code) >= 0) {
        //This entity has an issue.  Save it for later. 
        //entity.pause(); //uncommento to autopause
        bad_entities.push({e : entity, code : response_code});
      }
      if(RED_CODES.indexOf(response_code) >= 0) {
        //this if checks for redirections (3xx)
        red_entities.push({e : entity, code : response_code});        
      }
      already_checked[url] = true;
    }
  }
  var column_names = ['Type','CampaignName','AdGroupName','Id','Headline/KeywordText','ResponseCode','DestUrl'];
  var attachment = column_names.join(",")+"\n";
  for(var i in bad_entities) {
    attachment += _formatResults(bad_entities[i],",");
  }
  for (var j in red_entities) {
    attachment += _formatResults(red_entities[j],","); 
  }
  if(bad_entities.length > 0 || red_entities.length > 0) {
    var options = { attachments: [Utilities.newBlob(attachment, 'text/csv', 'bad_red_urls_'+_getDateString()+'.csv')] };
    var email_body = "There are " + bad_entities.length + " urls that are broken. And "+ red_entities.length + ". See attachment for details.";      
    for(var i in TO) {
      MailApp.sendEmail(TO[i], SUBJECT, email_body, options);
    }
  }  
}
  
//Formats a row of results separated by SEP
function _formatResults(entity,SEP) {
  var e = entity.e;
  if(typeof(e['getHeadline']) != "undefined") {
    //this is an ad entity
    return ["Ad",
            e.getCampaign().getName(),
            e.getAdGroup().getName(),
            e.getId(),
            e.getHeadline(),
            entity.code,
            e.getDestinationUrl()
           ].join(SEP)+"\n";
  } else {
    // and this is a keyword
    return ["Keyword",
            e.getCampaign().getName(),
            e.getAdGroup().getName(),
            e.getId(),
            e.getText(),
            entity.code,
            e.getDestinationUrl()
           ].join(SEP)+"\n";
  }
}
  
//Helper function to format todays date
function _getDateString() {
  return Utilities.formatDate((new Date()), AdWordsApp.currentAccount().getTimeZone(), "yyyy-MM-dd");
}
