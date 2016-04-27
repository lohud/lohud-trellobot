var gulp = require('gulp');
var $    = require('gulp-load-plugins')();

var express = require('express')
  , logger = require('morgan')
  , app = express()
  , port = process.env.PORT || 8080
  , url = require('url')
  , http = require('http')
  , bodyParser = require('body-parser')
  , mailer = require('./mailer')
  , credentials = require('./credentials')
  , authHelper = require('./authHelper')
  , trello = require('./trello')

var sassPaths = [
  'static/bower_components/foundation-sites/scss',
  'static/bower_components/motion-ui/src'
];

gulp.task('sass', function(){
  return gulp.src('scss/app.scss')
    .pipe($.sass({
      includePaths: sassPaths
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe(gulp.dest('static/css'));
});

gulp.task('default', ['sass'], function(){
  gulp.watch(['scss/**/*.scss'], ['sass']);
});

trello.grab();
mailer.refresh();
mailer.checkMail();

app.use(logger('dev'))
app.use(express.static(__dirname + '/static'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Tell app to use jade
app.set('view engine', 'jade');

app.get('/', function (req, res, next){
  try {
    res.render('homepage', {
      title : 'Trellobot | lohud.com',
      auth: authHelper.getAuthUrl()
    });
  } catch (e){
    next(e)
  }
})

app.get('/authorize', function (req, res){
  var url_parts = url.parse(req.url, true);
  var code = url_parts.query.code;
  var token = authHelper.getTokenFromCode(code, mailer.tokenReceived, res);
  // console.log("Code: " + code);
  // console.log("Request handler 'authorize' was called.");
})

app.post('/post',function(req,res){

  // Grab the message and user
  // var allResponse = credentials.slack.respond(req.body, function(hook){
  //   return rawmessage = hook.text,
  //          user = hook.user_name
  // });

  var response = req.body;
  // console.log(response);

  // Clean up the message
  message = response['text'].replace(response['trigger_word'] + ' ','');
  channel = "#" + response['channel_name'];

  var command = message.split(" ");
  var typeofCommand = command[0];

  if (typeofCommand == 'move'){
    var assetId = command[1];
    var destination = command[2];

    var reply =  {
          text: 'We are now moving assetId `' + assetId + '` to destination `' + destination +'`. Please be patient, sometimes our courier hits cybertraffic.',
          username: 'Kif Kroker',
          icon_emoji: ':kif:',
      };
    trello.move(assetId, destination);

  } else if (typeofCommand == 'list'){
    var assets = trello.list();
    console.log('gulpfile 99: ' + assets);

    for (var i = 0; i < assets.length; i++){
      credentials.slack.send({
          text: "`"+assets[i]+'` is ready',
          channel: channel,
          username: 'Zoidberg',
          icon_emoji: ':Zoidberg:',
      });
    }

  } else if (typeofCommand == 'help'){
    var typeofHelp = command[1];

    if (typeofHelp == undefined){
      var reply = {
        text: 'Good news everyone! Type `trellobot (or /bot) help commandlist` to view a list of commands, or type `trellobot (or /bot) help *name of command*` to learn how the commands work',
        username: 'Prof. Farnsworth',
        icon_emoji: ':farnsworth:'
      }
    } else if (typeofHelp == 'commandlist'){
      var reply = {
        text: 'We currently have three commands! They are `list`, `move` and `help`',
        username: 'Prof. Farnsworth',
        icon_emoji: ':farnsworth:'
      }
    } else if (typeofHelp == 'list'){
      var reply = {
        text: 'Use `list` to view all stories available/ready for posting',
        username: 'Prof. Farnsworth',
        icon_emoji: ':farnsworth:'
      }
    } else if (typeofHelp == 'move'){
      var reply = {
        text: 'Use move, followed by ID number, followed by the name of the list. For example: `move 12345678 done` to move it to Done, or `move 87654321 embargoed` to move to Embargoed. It might take a few moments before the card moves.',
        username: 'Prof. Farnsworth',
        icon_emoji: ':farnsworth:'
      }
    } else if (typeofHelp == 'help'){
      var reply = {
        text: "I think we're stuck in an infinity loop...",
        username: 'Prof. Farnsworth',
        icon_emoji: ':farnsworth:'
      }
    }
  } else {
    var reply =  {
            // text: 'text = ' + message,
            text: "I just finished turbo-charging this bot's matter compressor! Type `help` to get started!",
            username: 'Prof. Farnsworth',
            icon_emoji: ':farnsworth:'
        };
  }

  res.json(reply);
  res.end();


});

// LISTEN!
app.listen(port, "localhost")

