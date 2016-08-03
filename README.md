# TJN/lohud's Slackbot

Run ``npm install`` to install dependencies, ``npm start`` to run the project, project code lives in Gulpfile.

 - Using Jade for page templating (does little to nothing right now)
 - Proxy works on data server (through Apache2 proxypass config)
 - Plugged in Angularjs (does little to nothing right now)

Run ``forever gulpfile.js`` to keep service running on server "forever"

##What this bot does

This bot does a number of things right now (and hopefully more in the future).

It queries Trello for a specific board and a specific list, and watches it for cards that move in/out and announces it to a channel.

It queries an Outlook inbox and looks for emails from a specific sender and then announces to a channel when there are new emails (essentially, a pull-push notification).

It features a few basic commands, triggered by "trellobot" ~~or "/bot"~~, to manipulate trello cards. Functionality is limited, and is not entirely dynamic (only works with a few lists, lists were manually configured). 

- trellobot help
- trellobot move
- trellobot list

##Why this bot does what it does

Production communication is moving to Slack. We use Trello to update our story statuses (if it's ready for posting, if it's not) and right now communication is through email - often gets lost and too cumbersome.

This will allow our production/audience team to chat and receive updates.

The Outlook inbox receives specific alerts from various sources. This bot will watch for those and inform the entire production/audience team.

##What are the pieces

- **authHelper.js** authenticates with Outlook through OAuth2.
- **gulpfile.js** currently stores the Trello logic and has basic incoming integration
- **mailer.js** holds the Outlook logic
- **credentials.js** holds your secret keys and tokens. You will need them from Outlook, Slack and Trello.
- **trello.js** holds your trello functionality
- **bot.js** this has the bot functions

##Dependencies

Not all the installed dependencies are currently required/used. I know this is bad and I feel bad. Feel free to junk some. I'll eventually do cleanup. 

##What Kai needs to do next

Code has been refactored a little to start compartmentalizing the different functions a little more. "Callback hell" is the next series of things I need to fix. Currently storing refresh token and trello assets in local files ``trello.json`` and ``token.json`` in order to skip the reset issues we were having (bot would randomly die, causing auth to be lost and bot to re-announce assets as they were kept in memory instead of storage).

Will have to explore security concerns there more, early look into bcrypt is... not too promising.

~~Still need to figure out what is/was killing the bot, but we've resolved the "undefined" error that was plaguing us some nights. ~~

Undefined error was caused by Trello servers going down for maintenance (iirc). The server going down for maintenance is also causing the bot to die and restart - need a more elegant way to capture this event as it also leads to sometimes flooding slack with "The bot restarted" alerts.

Some quick patches were made at the last minute prior to hand-off. Jade has been switched to Pug but has not been removed.

##BIG PROBLEMO
Running ``forever list`` is throwing a blank on the DigitalOcean droplet. Process is still running, but not being registered. Using `pkill node` will restart the process, but will be brought up instantaneously. Not entirely sure what's going wrong, will need to be investigated much more. 