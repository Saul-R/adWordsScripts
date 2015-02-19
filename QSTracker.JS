// Original script by Russell Savage, modified by Saul-R
//To do: Connect to database, now it's linked to a google spreadsheet (limited size)

var email_address = ["alex.g@dotcomrepublic.com"]; // Change this to be notified of changes
var label_name = "Track QS";
 


function main() {
  var labelIterator = AdWordsApp.labels().withCondition("Name = '" + label_name + "'").get();
  // If there is no label, this is the first time this script is running
  if(!labelIterator.hasNext()){
    // Create the spreadsheet
    var spreadsheet = SpreadsheetApp.create("AdWords Quality Score Tracker");
    Logger.log("Spreadsheet for QS history created: " + spreadsheet.getUrl());
    var sheet = spreadsheet.getActiveSheet();
    sheet.setName("QS history");
    // Put in the table headings
    sheet.getRange(1, 1, 1, 6).setValues([["Date", "Campaign", "AdGroup", "Keyword", "Quality Score", "Change"]]);
    sheet.getRange(1, 1, 1, 6).setFontWeight("bold");
    // Create the label and save the spreadsheet's URL in the description
    AdWordsApp.createLabel(label_name, "Marks Keywords for QS tracking. Results are here: " + spreadsheet.getUrl() + " (keep URL in this description)", "#339999");
    Logger.log("Label '" + label_name + "' has been created. Apply this label to all keywords want to track. Then run the script again.");
    for(i = 1; i <= 10; i++){
      AdWordsApp.createLabel("QS: " + i, "Used for QS comparison.", "#ffffff");
    }
    Logger.log("Ten additional labels ('QS: 1' to 'QS: 10') have been created. Those are needed by the script to compare old and new Quality Scores later. You can just ignore those.");
    return;
  }
  
  // There is a label so get it and get the spreadsheet's URL from its description
  label = labelIterator.next();
  var matches = new RegExp('key=([^&# ]+)').exec(label.getDescription());
  if (!matches || !matches[1]) {
    throw "Couldn't get spreadsheet ID from label description: " + label.getDescription();
  }
  var spreadsheetId = matches[1];
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var alert_text = new Array();
  var history = new Array();
  var currentTime = new Date();
  var today = (currentTime.getMonth() + 1) + "/" + currentTime.getDate() + "/" + currentTime.getFullYear();
  var keywordIterator = label.keywords().get();
  var line_counter = 0;
  while (keywordIterator.hasNext()) {
    var keyword = keywordIterator.next();
    line_counter++;
    var current_quality_score = keyword.getQualityScore();
    keywordLabelsIterator = keyword.labels().withCondition("Name STARTS_WITH 'QS: '").get();
    if(keywordLabelsIterator.hasNext()){
      keyword_label = keywordLabelsIterator.next();
      var matches = new RegExp('QS: ([0-9]+)$').exec(keyword_label.getName());
      old_quality_score = matches[1];
    }else{
      old_quality_score = 0;
    }    
    // For the history also note the change or whether this keyword is new
    if(old_quality_score > 0) var change = current_quality_score - old_quality_score;
    else var change = "NEW";
    var row = [today, keyword.getCampaign().getName(), keyword.getAdGroup().getName(), keyword.getText(), current_quality_score, change];
    history.push(row);
    // If there is a previously tracked quality score and it's different from the current one...
    if(old_quality_score > 0 && current_quality_score != old_quality_score){
      // Make a note of this to log it and possibly send it via email later
      alert_text.push(current_quality_score + "\t" + old_quality_score + "\t" + change + "\t" + keyword.getText());
      // Remove the old label
      keyword.removeLabel(keyword_label.getName());
    }
    // Store the current QS for the next time by using a label
    keyword.applyLabel("QS: " + current_quality_score);
  }
  
  if(line_counter == 0){
    Logger.log("Couldn't find any keywords marked for quality score tracking. To mark keywords for tracking, apply the label '" + label_name + "' to those keywords.");
    return;
  }
  Logger.log("Tracked " + line_counter + " keyword quality scores. To select different keywords for tracking, apply the label '" + label_name + "' to those keywords.");
  // Store history
  var history_sheet = spreadsheet.getSheetByName('QS history');
  history_sheet.getRange(history_sheet.getLastRow()+1, 1, history.length, 6).setValues(history);  
  // If there are notes for alerts then prepare a message to log and possibly send via email
  if(alert_text.length){
    var message = "The following quality score changes were discovered:\nNew\tOld\tChange\tKeyword\n";
    for(i = 0; i < alert_text.length; i++){
      message += alert_text[i] + "\n";
    }
    // Also include a link to the spreadsheet
    message += "\n"
      + "The complete history is available at "
      + spreadsheet.getUrl();
    Logger.log(message);
    // If there is an email address send out a notification
    if(email_address && email_address != "YOUR_EMAIL_HERE"){
      MailApp.sendEmail(email_address, "Quality Score Tracker: Changes detected", message);
    }
  }
}
