# Bishop Beginner Documentation

## Purpose
This document is meant as a tutorial for Bishop game authors without any previous programming experience. It will probably be helpful to others as well, but it will definitely move slower than more conventional API documentation.

I started Bishop with the goal of making a tool that would have been simple enough for 12-year-old me to work with - I knew I could think about programs the "right" way, but my C++ compiler was too tricky to get working right, and I didn't understand how to install other setups, such as the one for Python. Bishop requires no installation, no compilation, and no special tools outside of a text editor and a modern web browser - with a few tweaks, you wouldn't even need the internet. I'd like to think the framework is complex, but not complicated. You can do a lot with it once you get the hang of the format (or if you happen to know some JavaScript), but you can have a player moving back and forth between rooms with about 20 lines of code (and most of those would just be brackets!).

I'll do my best to keep this updated as the design of Bishop changes over time, but you should know that `api.md` is going to probably end up being the definitive guide to what's rolling around in the API. Let's get started!

## Getting set up
As I mentioned above, you need two things:

### Browser
If you start getting into some funky corners of JavaScript on your own, you may run into browser compatibility issues. As-is, however, Bishop appears to play well with recent (2016) versions of Chrome, Firefox, and Microsoft Edge. There isn't anything fancy under the hood. Personally, I use Chrome while I'm developing.

### Text editor
This one is trickier than it sounds -- programs like Microsoft Word are great for writing things meant to be read by humans, but your game's code is not one of those things. Hidden in the guts of every Word document is thousands (millions?) of bytes of extra data that you don't see - info about which font to use where, how much space to put between paragraphs, things like that. It's why only certain programs can open `.doc` files - there's a lot to keep track of.

Anyway, *metadata* like that gets in the way of coding, plus Microsoft Office costs a hundred-something dollars now. You need something lower octane. Luckily, there are several built-in options for you: **On Windows**, the "Notepad" program is perfect for what we're doing, and it's been pre-packaged with Windows for at least 20 years. It's usually hidden in the "Programs" list in the start menu, under "Accessories."

**On Mac**, there should be a program called "TextEdit" in the "Applications" folder that will do the trick. If you're running **Linux**, I suspect you already have a preferred editor; you have a bunch to choose from.

You'll notice when you open one of these applications that it's noticeably uglier than a Word doc -- that's because all of that formatting cruft is left out, and all you get is the text. That's what we want. (Side note: If you still see "rich text" options like making text bold, or changing the font, you probably opened "Wordpad" instead of "Notepad." You don't want that one.)

There are lots of third-party options for text editors, too: I wrote a lot of Bishop using [Atom](https://atom.io/), a free code editor that is made by the GitHub people. It's worked well for me on both Fedora Linux and Windows 10. [Sublime Text](https://www.sublimetext.com/) is also widely used. It's "free to evaluate," but a license will cost you $70. For what it's worth, there's nothing forcing you to buy a license, it's just the nice thing to do if you stick with it. [Notepad++](https://notepad-plus-plus.org/) is another one that's been around a long time, but it looks like development is still chugging along.

### Files
OK, you'll want to create a directory somewhere to keep your game -- that's treated as a "folder" on in Windows and Mac. You only need three files in it:
* `bishop.js` - this one you shouldn't even need to open, but you're welcome to change anything in it if you want. This file is the game "engine" -- it's what loads up all your game information from `gamedata.js` and figures out what to display on the screen. There are plenty of ways to get this file. If you're familiar with GitHub, you can clone [the repo](https://github.com/rabdill/bishop). You can also go to that page and click the "Clone or download" button -- that should give you the option to download all the code. T**The simplest way:** Just open up the [most recent version of `bishop.js`](https://raw.githubusercontent.com/rabdill/bishop/master/bishop.js), copy the whole thing, and paste it into a text file. Save it as `bishop.js` and you're all set.
* `index.html` - this is going to be the page from which you actually play your game! We haven't made this page yet. For the tutorial, we're just going to stick with a plain vanilla web page to display our game. You can use [the example `index.html`](https://raw.githubusercontent.com/rabdill/bishop/master/index.html.sample) in the repo, and fetch it in the same ways as `bishop.js` above.
* `gamedata.js` - this is the juicy part. It's the file where you'll write the code for your game. (It can be called anything you want, but I'll be using this name in all examples.) We haven't made this one yet. It's coming.

There are two quick notes I want to make about saving and opening files, in case you haven't run into this before:
* Sometimes, the computer will try to be helpful and guess what file extension you want when you're saving a file. It may try to add `.txt` to the end of your file, or `.doc` or some other silliness. You don't want this. If you see a file called `gamedata.js`, for example, **that's the whole name of the file.**
* Most operating systems like to remember which program you use to open which types of files -- it's why clicking on a `.doc` file opens Word, for example, instead of iTunes. However, when you're programming, these associations are usually not right, because we're not accessing the files in the usual way. Double-clicking on `index.html`, for example, will probably launch a web browser instead of your text editor. `bishop.js` is going to be even weirder; it might not have any guess how to open it. The safest way to open these files is to open your text editor of choice and use it to open the file.

## Your first room
OK, here we go. First, open your web browser, so we can see the results of all the tinkering coming up. We want to open `index.html` in the browser -- you may be able to do that just by double-clicking on the file, but the more reliable way is to open up a browser like Chrome and holding down the `Ctrl` key and tapping the `o` key (or `command + o` on Mac), or, if your window has a "File" menu in the top-left corner, selecting "Open file..." or something to that effect. We can use the browser to open files just like we would in Atom or Word or any other file editor.

What you're presented with is not particularly exciting yet: It should be an almost empty page, with the words "This is sample text. If you see this, something went wrong with loading your game." in the middle of everything. In this case, the "something" that went wrong with your game was that it doesn't exist.

So now, let's go back to your text editor window, and **create a file called `gamedata.js`**. The first thing we need to do is a little housekeeping. First, we need to declare the `game` object, which we just use to store some information about the game itself. It should look like this:

```javascript
game = {
	settings: {
		title: "Cool Tutorial Game"
	}
};
```
You can change the words `"Cool Tutorial Game"` to be whatever you want -- that's going to be the title of your new game. (Don't worry too much about this right now -- you can change any of these values at any time you want.)

This is actually probably a good time to explain some of the important *syntax* you'll need to know -- that is, the format your game needs to take so that Bishop (and your browser) can understand it. I'll go line by line for now, but if you get stumped, **all of this code is JavaScript**, which means there's an internet full of FAQs waiting to be found.

```javascript
game = {
```
OK, so this is declaring a *variable* called `game` -- a variable is just the name for something we want the computer to keep track of. If you said `x = 7`, that would create a variable called `x`, and if later on we wanted to check what its value was, the computer would know `7`.

`game`, though, is more complicated than just a number -- it's an *object*, which has a very specific meaning in JavaScript. Essentially, it's a collection of *key-value pairs*, which is a fancy way of saying it's a group of more variables, more or less. You use objects to group together related properties. If you wanted variables to keep track of information about a person, for example, you might start with something like this:

```javascript
name = "Mike";
age = 21;
favorite_color = "blue"
```
This doesn't use objects, only variables. But what happens if you want to keep track of more than one person? Then you'd need to name variables like `age_of_mike` and `favorite_color_of_mike`, and so on, which can get annoying really quickly, to say nothing of how tricky it's going to be to track down later. Instead, we can use objects:

```javascript
player1 = {
    name: "Mike",
    age: 21,
    favorite_color: "blue"
};
```
That looks much tidier! Now, we can create `player2`, `dog1`, etc., and still be able to keep track of their properties. (Incidentally: You use periods to access properties of an object. In the example above, for example, `player1.age` is `21`, and `player1.name` is `"Mike"`.)

OK, so back to our game code. We have `game = {` so far, which tells the computer that it should get ready to receive an object -- that `{` ("opening brace") is used to signify the start of an object, and anything up until the "closing brace" `}` will be considered part of the object. Onto the next line!
```javascript
game = {
    settings: {
```
Whoa boy. So, we're declaring our first property of `game`, and it's called `settings`... but it's already getting tricky. That's because `settings` is *also an object* -- they can be nested inside of each other, and you can keep nesting them until your computer runs out of memory (but you probably shouldn't). Luckily, we're only going one extra layer.
There's another difference I should point out here, as well: Notice that when we declared `game`, we used an equals sign `=`, but when we're declaring properties in an object, we use a colon `:` instead. This is *required*. If you see an equals sign inside of an object, either something complicated is happening or there's a typo.
Onto the next line:

```javascript
game = {
    settings: {
        title: "Survival",
```
Ah, finally! A property we can look at normally. This says the `settings` object has a property called `title`, and we want its value to be `"Survival"`.
If we wanted to access this value later, we'd use the same dot notation as I mentioned above (`player1.age`, or `player1.name`, etc.). We'll need more dots, though: For "title," we'd need to access it with `game.settings.title`. The dots can be *chained* one after the other, and you can keep adding them if you keep running into more objects. This will come in handy later.

Another important note: You'll see that `"Survival"` is in quotation marks `""`, but other words, like `title` and `game`, are not. That's because `"Survival"`, `title` and `game` are three totally different entities:

* `game` is the **name of a variable**, and can't be put into quote marks. It also **can't have any spaces**, because the computer would have no way of knowing when the variable name was over.
* `title` is a **property**, and you could put it into quotation marks if you wanted to. (If the property name contained a space or a hyphen `-`, you'd *need* to put it in quote marks -- again, so the computer will know that it's a property name.)
* `"Survival"` is a **value**, and it **must** be in quotation marks. This particular value is a **string** -- that is, a series of characters -- and if it didn't have quote marks around it, the computer would have no way to tell if it was a string or the name of a variable called `Survival`.
You'll get the hang of these as we go. Next line:

```javascript
game = {
	settings: {
		title: "Survival"
	}
```
We've got our first closing bracket here -- in this case, it closes the object we're assigning to the `settings` property. JavaScript doesn't care too much about spacing, or lining up text, but JavaScript *programmers* care about them a great deal: Once you start getting into more complex code, using tabs (or a set number of spaces) to keep things lined up might be the only thing keeping your code readable. (Text editors especially for coding, such as Sublime and Atom, can be very helpful with this.)
For example, the entire `game` declaration could have been written on one line:
```javascript
game={settings:{title:"Survival"}};
```
That looks pretty ugly already, and we've only got the title declared. Whitespace is your friend, and you'll get the hang of when to indent once you get more code under your belt. The general rule is to indent when you're moving "down" a layer -- so, after `game = {` you'd want to indent, because you're inside the object for `game`. And after `settings: {` you'd want to indent again, because you're moving into an object inside of that first one.
That way, when you start working your way back *out* of all these nested objects, you can keep track of which brackets are closing which brackets: Just move one tab backward to add your closing brace, and it should be lined up with the name of the object you're closing. Which brings us to our final line:

```javascript
game = {
	settings: {
		title: "Survival",
	}
};
```
Now, we close our final object in the pile (the `game` object), and finish off the statement with a semicolon `;`. The semicolon isn't *strictly* necessary, but it's a good idea: It tells the computer, "Hey, this statement is over."

Wow. OK, so after all that, we've got a name for our game. Go back over to your browser and refresh the page -- your title should now be the headline, instead of "Your Custom Game." Congrats!
