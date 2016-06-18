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
OK, here we go.
