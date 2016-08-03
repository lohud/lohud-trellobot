var Trello = require('node-trello')
  , credentials = require('./credentials')
  , t = new Trello(credentials.t1, credentials.t2)
  , fs = require('fs')
  , tFile = require('./trello.json')
  , bot = require('./bot')

var currentLength = 0;
var currentAssets = [];
var text, channel, username, emoji;
var date = Date();

for (var i = 0; i < tFile.length; i++){
  // console.log(tFile[i]);
  currentAssets.push(tFile[i]);
}

// Story asset routing board id: 559ea83005b8ca18ee32c19f
// Embargoed list id: 55b13a806c042819824c029f
// Done list id: 56af9e1a8f6e960993eb24ac
// Posted, needs finessing: 559ea8807d35a7f8ec25edc4

var grab = function (){
  t.get(
    "/1/lists/559ea8976fe031f2e5147baa/cards", { 
      // filter: "open", 
      // limit: "1" 
    }, 
    function (err, data){
      // if (err) throw err;
      if (err){
        console.log(err);
        text = 'Our bot died at:' + date;
        channel = '#trellotest';
        username = 'Bender';
        emoji = ':bender:';
        bot.sendMessage(text, channel, username, emoji);
        grab();
      } else {
        // console.log(data);
        receiveData(data);
      }
    }
  );
  // set refresh frequency
};

var move = function (assetId, destination, channel){

  console.log('Trello.js has received the move command');

  var lists = ['/1/lists/559ea8976fe031f2e5147baa/cards',"/1/lists/56af9e1a8f6e960993eb24ac/cards","/1/lists/55b13a806c042819824c029f/cards","/1/lists/559ea8807d35a7f8ec25edc4"];

  for (var i = 0; i < lists.length; i++){
    t.get(lists[i], {

    }, function (err, data){
      if (err){
        console.log(err);
      } else {
        for (var i = 0; i < data.length; i++){
          var cardName = data[i]['name'].split(" ");
          var cardId = cardName[0];

          if (assetId == cardId){
            // console.log(data[i]['id']);
            // console.log('this is the assetId: ' + cardId);
            cleanedDestination = destination.toLowerCase();
            if (cleanedDestination == 'done'){
              t.put("/1/cards/"+data[i]['id'],{
                idList: '56af9e1a8f6e960993eb24ac'
              }, function (err){
                if (err){
                  console.log(err);
                }
              })
            } else if (cleanedDestination == 'embargoed' || destination == 'embargo') {
              t.put("/1/cards/"+data[i]['id'],{
                idList: '55b13a806c042819824c029f'
              }, function (err){
                if (err){
                  console.log(err);
                }
              })
            } else if (cleanedDestination == 'ready'){
              t.put("/1/cards/"+data[i]['id'],{
                idList: '559ea8976fe031f2e5147baa'
              }, function (err){
                if (err){
                  console.log(err);
                }
              })
            }
          }
        }
      }
    })
  }
  console.log('Trello.js has fired off the move command');
};

var list = function (listname, channel){
  console.log('Trello.js has received the list command');
  // console.log(currentAssets);
  // console.log(listname);
  // console.log(channel);

  if (listname == 'ready'){
    t.get(
      "/1/lists/559ea8976fe031f2e5147baa/cards", { 
        // filter: "open", 
        // limit: "1" 
      }, 
      function (err, data){
        // if (err) throw err;
        if (err){
          console.log(err);
        }
        checkList(data, channel);
      }
    );
  } else if (listname == 'embargoed' || listname == 'embargo'){
    t.get(
      "/1/lists/55b13a806c042819824c029f/cards", { 
        // filter: "open", 
        // limit: "1" 
      }, 
      function (err, data){
        // if (err) throw err;
        if (err){
          console.log(err);
        }
        checkList(data, channel);
      }
    );
  } else if (listname == 'done'){
    t.get(
      "/1/lists/56af9e1a8f6e960993eb24ac/cards", { 
        // filter: "open", 
        // limit: "1" 
      }, 
      function (err, data){
        // if (err) throw err;
        if (err){
          console.log(err);
        }
        checkList(data, channel);
      }
    );
  } else if (listname == undefined){
    text = 'Sorry, you need to specify which list. Use `trellobot help list` to learn how to use this command.';
    username = 'Prof. Farnsworth';
    emoji = ':farnsworth:';
    console.log('t+266');
    bot.sendMessage(text, channel, username, emoji);
  }
  console.log('Trello.js has fired off the list to Slack');
  // return listAssets;
};

var checkList = function (data, channel){
  username = 'Calculon';
  emoji = ':Calculon:';

  if (data.length == 1){
    text = 'There is nothing in this list',
    console.log('t+219');
    bot.sendMessage(text, channel, username, emoji);
  } else {
    for (var i = 0; i < data.length; i++){
      // Check if list is push-worthy
      if (i > 0){
        text = "`"+data[i]['name']+'`';
        console.log('t+226');
        bot.sendMessage(text, channel, username, emoji);
      }
    }
  }
}

var receiveData = function (data){
  // console.log(data);
  // console.log(date, ': just received trello data');
  currentLength = data.length;
  var newAssets = [];
  // console.log(currentAssets);
  // console.log(data);

  channel = '#audience';
  username =  'Zoidberg';
  emoji = ':Zoidberg:';

  // Loop through the list
  for (var i = 0; i < data.length; i++){
    // Check if list is push-worthy
    if (i > 0){
      newAssets.push(data[i]['name']);

      // Check if it exists in assets
      if (currentAssets.indexOf(data[i]['name']) > -1){
        // console.log('found it')
      } else {
        // console.log(data[i]['name'], 'does not exist, so we are pushing and announcing')
        currentAssets.push(data[i]['name']);
        text = "`"+data[i]['name']+'` is ready';
        console.log('t+299');
        bot.sendMessage(text, channel, username, emoji);
        // console.log(currentAssets);
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
      text = "`"+currentAssets[x]+'` has been moved out of ready';
      console.log('t+317');
      bot.sendMessage(text, channel, username, emoji);
      currentAssets = newAssets;
    }
  }
  // end loop through the asset

  // console.log(date, " just grabbed")
  setTimeout(grab, 10000);
  var newJSON = JSON.stringify(currentAssets);
  fs.writeFile('./trello.json', newJSON, function (err){
    if(err){
        return handleError(err);
        console.log(err);
    } else {
      // console.log('your currentAssets has been saved');
      // console.log(newJSON);
    }
  });
}

module.exports = {
  grab: grab,
  move: move,
  list: list,
  receiveData: receiveData,
  checkList: checkList
}