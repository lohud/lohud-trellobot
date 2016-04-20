var Trello = require('node-trello')
  , credentials = require('./credentials')
  , t = new Trello(credentials.t1, credentials.t2)
  , Slack = require('node-slack')


var slack = new Slack(credentials.webhookUri);

var currentLength = 0;
var currentAssets = [];

// URL arguments are passed in as an object.

// Story asset routing board id: 559ea83005b8ca18ee32c19f
// Embargoed list id: 55b13a806c042819824c029f
// Done list id: 56af9e1a8f6e960993eb24ac
// Posted, needs finessing: 559ea8807d35a7f8ec25edc4

var grab = function() {
  t.get(
    "/1/lists/559ea8976fe031f2e5147baa/cards", { 
      // filter: "open", 
      // limit: "1" 
    }, 
    function(err, data) {
      // if (err) throw err;
      if (err) {
        console.log(err);
      }
      // Check to see if there are changes
      if (currentLength == data.length) {
        // console.log("Don't do anything");
      } else {
        
        // Update the base length
        currentLength = data.length;
        var newAssets = [];

        // Loop through the list
        for (var i = 0; i < data.length; i++){
          // Check if list is push-worthy
          if (i > 0) {
            newAssets.push(data[i]['name']);

            // Check if it exists in assets
            if (currentAssets.indexOf(data[i]['name']) > -1) {
              // console.log('found it')
            } else {
              // console.log(assets.indexOf(data[i]['name']))
              // console.log('does not exist, so we are pushing and announcing')
              currentAssets.push(data[i]['name']);
              slack.send({
                  text: "`"+data[i]['name']+'` is ready',
                  channel: '#trellotest',
                  username: 'Zoidberg',
                  icon_emoji: ':Zoidberg:',
              });
            }
          }
        }
        // End loop through the list

        // Loop through the asset
        for (var x = 0; x < currentAssets.length; x++){
          var assetpos = newAssets.indexOf(currentAssets[x]);

          // check if assets exist in data
          if (newAssets.indexOf(currentAssets[x]) > -1){
            // console.log(currentAssets[x]+' is still here')
          } else {
            // console.log(currentAssets[x]+' is now gone')
            slack.send({
                text: "`"+currentAssets[x]+'` has been posted',
                channel: '#trellotest',
                username: 'Zoidberg',
                icon_emoji: ':Zoidberg:',
            }, function(err, response){
              console.log(err);
              currentAssets = newAssets;
            });
          }
        }
        // end loop through the asset
      }
      
    }
  );
  // set refresh frequency
  setTimeout(grab, 5000);
};

var move = function (assetId, destination) {
  t.get("/1/lists/559ea8976fe031f2e5147baa/cards", {

  }, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      for (var i = 0; i < data.length; i++) {
        var cardName = data[i]['name'].split(" ");
        var cardId = cardName[0];

        if (assetId == cardId) {
          console.log(data[i]['id']);
          console.log('this is the assetId: ' + cardId);

          if (destination == 'done' || destination == 'Done') {
            t.put("/1/cards/"+data[i]['id'],{
              idList: '56af9e1a8f6e960993eb24ac'
            }, function (err){
              if (err) {
                console.log(err);
              }
            })
          } else if (destination == 'embargoed' || destination == 'Embargoed' || destination == 'Embargo' || destination == 'embargo') {
            t.put("/1/cards/"+data[i]['id'],{
              idList: '55b13a806c042819824c029f'
            }, function (err){
              if (err) {
                console.log(err);
              }
            })
          }
        }
      }
    }
  })
    
};


var list = function () {
  return currentAssets;
};


module.exports ={
  grab: grab,
  move: move,
  list: list
}