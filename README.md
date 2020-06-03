# General

This is an exam work for programming courses.

I have created a Telegram bot for playing 'Hangman' in English language, using NodeJS and library 'node-telegram-bot-api'. 

This bot works by reacting to text messages and button-clicks (while choosing a letter).

# Code structure

index.js contains the code for program.

Code has objects: classes, arrays, functions and events; there is a custom keyboard layout in draw(). 

# Gameplay

To create new game, one of the players uses command: /create. 

After that, bot gives unique game id.

To join existing game, the other player needs to input like this: /join [ID] 

Then, player 1 launches game with: /begin [word] 

After finishing the game, players swap roles, and they can restart or exit the game.
