## The project
Bishop's Map is a Javascript-based interactive fiction engine designed for allowing text adventure games to be played in a browser. The engine itself is entirely client-based, which means the work is performed entirely by the player's web browser and server-based code isn't necessary for successful operation.

**Bishop's Map is not production-ready.** It is still very much a work in progress, and even a cursory peek at [the project's Issues page](https://github.com/rabdill/bishops_map/issues?q=is%3Aopen+is%3Aissue) will show you how far we still have to go. Check out the changelog for info on how things are going and what works where, but there are still gaps in the engine's capabilities.

In addition, *you should expect multiple breaking changes between now and the 1.0 release.* The changelog *should* make ample notes of what is changing and what upgrade dangers might arise, but the project's versioning won't be [semantically meaningful](http://semver.org/) until after 1.0.

## Implementation
Authors define the entirety of their game logic in a file called gamedata.js. For documentation on syntax and game logic, check out [the Bishop's Map wiki](https://github.com/rabdill/bishops_map/wiki). Once the game has been designed, all a player needs to do is open an HTML file that links together the Bishop's Map code with the game data.

When building the gameplay page, the included "index.html" should be helpful in determining basic requirements, but they are here as well:

* You may need to include as many as six Bishop's Map Javascript files for the game to operate properly:
  * "gamedata.js" and "defaults.js" are mandatory, as is "bishops_map.js." These three should be loaded in the order they were just mentioned.
  * Include "testing.js" after the others if you are still in a testing phase. Including the file does not mean the tests will be fired every time the game is loaded, but it keeps you from needing to remember to include it whenever you want to run a check.
  * Include "listening.js" and "talking.js" to enable speech-to-text and text-to-speech, respectively. "Listening" and "talking" refer to the behavior of the game, not the player - so including "talking.js" will allow the game to *talk* to the player using text-to-speech.
* Include a tag with an id of "gameName" if you want its inner HTML to be set to the name of your game. So, for example, `<h1 id="gameName"></h1>` at the top of the page would become `id="gameName">Your Custom Game Woo!</h1>` when your game is loaded. (The title of the game is set in [the game's metadata](https://github.com/rabdill/bishops_map/wiki/Storing-game-metadata).)
* Several `<p>` tags for displaying game information:
  * One with an id of "description" should be included, to display the text of the current room.
  * Another with id "error" will show the player error messages regarding their input.
* A `<form>` element. It doesn't have any id requirement, but you should include `action="#"` and wrap it around several specific elements:
  * A block element (span, paragraph, div, etc.) with an id of "prompt," which will be altered whenever a room or menu has a special phrase specified to ask the player for input. This element should have a default message in it to ask the player for input, such as "What to do?" or "Enter a command."
  * An input element of type "text" with an id of "command," which will be where the player enters the information they want to send back to the game engine.
  * An input element of type "submit" with an id of "sendCommand," which will trigger the engine to process the contents of the command box.
  * These elements are not submitted like a traditional HTML form, and would work as intended without the `<form>` tags. It's recommended they be put inside an HTML form so that typing in the box and pressing "Enter" will trigger the "submit" button, rather than forcing the player to click the button in between every command.
* If you are using the talking/listening capabilities of the engine, including buttons to toggle these capabilities is recommended:
  * A `<button>` tag with an id of "listening" and contents of whatever you'd like will be used to turn the speech-to-text feature on and off, so players can control when the game is listening to their microphone.
  * A `<button>` tag with an id of "talking," to allow the player to tell the text-to-speech feature to stop reading things out loud. It should be labeled something like "Stop talking."

## Serving the game
Because there is no server-side code, a site using only Bishop's Map (plus any other client-side libraries) only needs to be put somewhere from which players can retrieve the files.

### As a website
To run your game as a conventional website, you could easily use a traditional web server running something like Apache or Nginx, or simply put the files in a file-hosting service like Amazon S3. [Github Pages](https://pages.github.com/) is another option that should be totally free.

### As offline files
Distributing the files to players in other ways will give them the same access they would get if they were playing your game from your website. You can e-mail the files to players if you want, or send them a link to Dropbox or Google Drive. Transferring the files to a player's computer will work any way you want to move them, and as long as the player doesn't mess with the relative location of the files, it should work fine -- the files need to stay in the directories in which they come, but the player can put those files anywhere on their computer.

Once a player has the files, all they need to do is open the "index.html" file in a browser and start playing. Most operating systems default to opening *.html files with the default browser, but they can also open files by opening the browser and selecting something like "Open..." from the "File" menu.

Though this method is more complicated, it has the added bonus of making your game available offline, so players don't need an internet connection to play. The only exception to this is any functionality you add that relies on third-party libraries that you do not include in the game directory: Google fonts, for example, or jQuery. The talking/listening features also require an internet connection.

### As a Chrome app
Bishop's Map comes pre-packaged with all the necessary files to allow the "index.html" file to be loaded as a Chrome application, allowing the game to appear in a player's "Apps" page in Chrome, or be loaded as a standalone app outside of a browser. All you have to do is download the files and follow these instructions:

([Full instructions from Google](https://developer.chrome.com/apps/first_app))

1. At chrome://flags, make sure "Experimental Extension APIs" is enabled.
1. At chrome://extensions, select "Load unpacked extension" and select the Bishops Map directory.
1. At chrome://apps, select your new Bishop's Map application!