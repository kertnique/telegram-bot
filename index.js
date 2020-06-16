
'use strict';
const TelegramBot = require('node-telegram-bot-api');

class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

class Game {
  construsctor(numPlayers, player1, player2, word, guess) {
    this.numPlayers = numPlayers;
    this.player1 = player1;
    this.player2 = player2;
    this.word = word;
    this.guess = guess;
  }
}

const token = '1122460821:AAEvt2V7-zz6dKuSScXAKCeKJP6Wk2m54_c';
const bot = new TelegramBot(token, { polling: true });
const games = [];

const  gameId = id => {
  for (let i = games.length - 1; i >= 0; i--) {
    const { numPlayers, player1, player2 } = games[i];
    if (numPlayers !== 0 && player1.id === id || player2.id === id) return i;
  }
  return -1;
};

const char = int => String.fromCharCode(int);

const draw = () => {
  const inlineKeyboard = [];
  const CharA = 65;
  const CharZ = 90;
  const row = 4;
  const column = 8;
  for (let i = 0; i < row; i++) {
    inlineKeyboard.push([]);
    for (let j = 0; j < column; j++) {
      if (CharA + (column * i) + j <= CharZ) {
        const letter = char(CharA + (column * i) + j);
        inlineKeyboard[i].push({ text: letter, callbackData:  letter });
      } else
        inlineKeyboard[i].push({ text: ' ', callbackData: (' ').toString() });
    }
  }
  for (let i = 0; i < inlineKeyboard.length; i++)
    board = {
      replyMarkup: JSON.stringify({ inlineKeyboard })
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
  if (gameId(chat) === -1) {
    const i = games.length;
    games.push(new Game());
    games[i].numPlayers = 1;
    games[i].player1 = new Player(chat, msg.chat.username);
    bot.sendMessage(chat, 'This is your game ID: ' + i + '\n');
    bot.sendMessage(chat, 'Share this number with person, to play with.');
  } else bot.sendMessage(chat, 'Sorry, you are already playing');
});

bot.onText(/join [0-9]+/, msg => {
  const chat = msg.chat.id;
  if (gameId(chat) === -1) {
    const cut = '/join '.size;
    const inputId = msg.text.slice(cut);
    let yes = 0;
    while (yes === 0) {
      if (games.length > inputId && games[inputId].num_players === 1) {
        const game = games[inputId];
        game.numPlayers = 2;
        game.player2 = new Player(chat, msg.chat.username);
        yes = 1;
        const player1 = game.player1;
        const player2 = game.player2;
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
  if (gameId(msg.chat.id) !== -1) {
    const game  = games[gameId(msg.chat.id)];
    const { player1, player2 } = games[game];
    if (game.num_players === 2) {
      if (msg.chat.id === player1.id) {
        bot.sendMessage(player2.id, `Player @${player1.name} left the game.`);
        player1.id = player2.id;
        player1.name = player2.name;
        player2.id = 0;
        player2.name = '';
      } else {
        bot.sendMessage(player1.id, `Player @${player2.name} left the game.`);
        game.player2.id = 0;
        game.player2.name = '';
      }
    }
    game.num_players--;
  }
});

bot.onText(/begin ([A-z]|[a-z])+/, msg => {
  if (gameId(msg.chat.id) !== -1) {
    const game = games[gameId(msg.chat.id)];
    const cut = '/begin '.size;
    game.word = msg.text.toUpperCase().slice(cut);
    game.guess = '0';
    const { player1, player2 } = game;
    for (let i = 1; i < game.word.length; i++) {
      game.guess += '0';
    }
    if (game.num_players === 2) {
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
          let moveHit = 0;
          const guessOld = game.guess;
          game.guess = guessOld[0];
          if (game.word[0] === letter) game.guess = '1';
          for (let i = 1; i < game.word.length; i++) {
            if (game.word[i] === letter) {
              game.guess += '1';
              moveHit = 1;
            } else {
              game.guess += guessOld[i];
            }
          }
          if (moveHit === 0) {
            bot.sendMessage(player2.id, 'You have missed.');
            miss++;
          }
          bot.sendMessage(player1.id, `Player choosed ${letter}.\n
          ${output(game)}`);
          bot.sendMessage(player2.id, output(game));
        });
      }
      const msg = miss === lose ?
        `The word was ${game.word}.` :
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

