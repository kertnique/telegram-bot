/* eslint-disable camelcase */
'use strict';
const TelegramBot = require('node-telegram-bot-api');

class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

class Game {
  construsctor(players, player1, player2, word, guess) {
    this.players = players;
    this.player1 = player1;
    this.player2 = player2;
    this.word = word;
    this.guess = guess;
  }
}

const token = '1122460821:AAEvt2V7-zz6dKuSScXAKCeKJP6Wk2m54_c';
const bot = new TelegramBot(token, { polling: true });
const games = [];


const  GameId = id => {
  for (let i = games.length - 1; i >= 0; i--) {
    const { players, player1, player2 } = games[i];
    if (players !== 0 && player1.id === id || player2.id === id) return i;
  }
  return -1;
};

const char = int => String.fromCharCode(int);

const draw = () => {
  const inline_keyboard = [];
  const Char_A = 65;
  const Char_Z = 90;
  const row = 4;
  const column = 8;
  for (let i = 0; i < row; i++) {
    inline_keyboard.push([]);
    for (let j = 0; j < column; j++) {
      if (Char_A + (column * i) + j <= Char_Z) {
        const letter = char(Char_A + (column * i) + j);
        inline_keyboard[i].push({ text: letter, callback_data:  letter });
      } else
        inline_keyboard[i].push({ text: ' ', callback_data: (' ').toString() });
    }
  }
  for (let i = 0; i < inline_keyboard.length; i++)
    board = {
      reply_markup: JSON.stringify({ inline_keyboard })
    };
  return board;
};

const output = id => {
  let out = '';
  for (let i = 0; i < games[id].word.length; i++) {
    const game = games[id];
    out += game.guess[i] === 1 ? game.word[i] : '_';
  }
  return out;
};

const win = game => {
  let IsWin = 1;
  for (let i = 0; i < games[game].word.length; i++) {
    if (games[game].guess[i] === 0) IsWin = 0;
  }
  return IsWin;
};

const end = game => {
  const { id, name } = games[game].player2.id;
  game = {
    word: '',
    guess: '',
    player2: {
      id: games[game].player1.id,
      name: games[game].player1.name,
    },
    player1: { id, name },
  };
};

bot.onText(/start|help/, msg => {
  const chat = msg.chat.id;
  bot.sendMessage(chat, `To create new game, use command /create\n 
  To join existing game, use command /join and your game ID`);
});

bot.onText(/create/, msg => {
  const chat = msg.chat.id;
  if (GameId(chat) === -1) {
    const i = games.length;
    games.push(new Game());
    games[i].players = 1;
    games[i].player1 = new Player(chat, msg.chat.username);
    bot.sendMessage(chat, 'This is your game ID: ' + i + '\n');
    bot.sendMessage(chat, 'Share this number with person, to play with.');
  } else bot.sendMessage(chat, 'Sorry, you are already playing');
});

bot.onText(/join [0-9]+/, msg => {
  const chat = msg.chat.id;
  if (GameId(chat) === -1) {
    const cut = '/join '.size;
    const input_id = msg.text.slice(cut);
    let yes = 0;
    while (yes === 0) {
      if (games.length > input_id && games[input_id].players === 1) {
        games[input_id].players = 2;
        games[input_id].player2 = new Player(chat, msg.chat.username);
        yes = 1;
        const player1 = games[input_id].player1;
        const player2 = games[input_id].player2;
        bot.sendMessage(chat, `Okay, you are playing with @${player1.name}`);
        bot.sendMessage(player1.id, `User @${player2.name} joined the game.
        To begin the game, use command /begin, after that type any word.`);
      } else {
        bot.sendMessage(chat, 'Sorry, wrong ID');
      }
    }
  } else {
    bot.sendMessage(chat, 'Sorry, you are already playing');
  }
});

bot.onText(/exit/, msg => {
  bot.sendMessage(msg.chat.id, 'Bye, see you later.');
  if (GameId(msg.chat.id) !== -1) {
    const game  = GameId(msg.chat.id);
    const { player1, player2 } = games[game];
    if (games[game].players === 2) {
      if (msg.chat.id === player1.id) {
        bot.sendMessage(player2.id, `Player @${player1.name} left the game.`);
        player1.id = player2.id;
        player1.name = player2.name;
        player2.id = 0;
        player2.name = '';
      } else {
        bot.sendMessage(player1.id, `Player @${player2.name} left the game.`);
        games[game].player2.id = 0;
        games[game].player2.name = '';
      }
    }
    games[game].players--;
  }
});

bot.onText(/begin ([A-z]|[a-z])+/, msg => {
  if (GameId(msg.chat.id) !== -1) {
    const game = GameId(msg.chat.id);
    const cut = '/begin '.size;
    games[game].word = msg.text.toUpperCase().slice(cut);
    games[game].guess = '0';
    const { player1, player2 } = games[game];
    for (let i = 1; i < games[game].word.length; i++) {
      games[game].guess += '0';
    }
    if (games[game].players === 2) {
      const board = draw();
      let miss = 0;
      let move = 0;
      const lose = 6;
      while (miss < lose && win(game) !== 1 && move === 0) {
        let letter;
        bot.sendMessage(player2.id, 'Please choose a letter', board);
        move = 1;
        bot.on('callback_query', query => {
          if (query.data !== undefined) {
            letter = query.data;
            move = 0;
          }
          let move_hit = 0;
          const guess_old = games[game].guess;
          games[game].guess = guess_old[0];
          if (games[game].word[0] === letter) games[game].guess = '1';
          for (let i = 1; i < games[game].word.length; i++) {
            if (games[game].word[i] === letter) {
              games[game].guess += '1';
              move_hit = 1;
            } else {
              games[game].guess += guess_old[i];
            }
          }
          if (move_hit === 0) {
            bot.sendMessage(player2.id, 'You have missed.');
            miss++;
          }
          bot.sendMessage(player1.id, `Player choosed ${letter}.\n
          ${output(game)}`);
          bot.sendMessage(player2.id, output(game));
        });
      }
      const msg = miss === lose ?
        `The word was ${games[game].word}.` :
        'Congratulations.';
      bot.sendMessage(player2.id, msg);
      end(game);
      bot.sendMessage(player1.id, `To exit, type /exit\n 
      To begin new game, type /begin and any word`);
      bot.sendMessage(player1.id, `To exit, type /exit\n 
      Else, wait for the other player to choose word`);
    } else {
      bot.sendMessage(msg.chat.id, 'You cannot play alone.');
    }
  } else {
    bot.sendMessage(msg.chat.id, 'You haven\'t chosen a game.');
  }
});
