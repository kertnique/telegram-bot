/* eslint-disable camelcase */
/* eslint-disable strict */
const TelegramBot = require('node-telegram-bot-api');

class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

class Game {
  construsctor(status, player1, player2, word, guess) {
    this.status = status;
    this.player1 = player1;
    this.player2 = player2;
    this.word = word;
    this.guess = guess;
  }
}

const token = '1122460821:AAEvt2V7-zz6dKuSScXAKCeKJP6Wk2m54_c';
const bot = new TelegramBot(token, { polling: true });
const games = [];


const  game_id = id => {
  for (let i = games.length - 1; i >= 0; i--) {
    if (games[i].status !== 0) {
      if (games[i].player1.id === id || games[i].player2.id === id) return i;
    }
  }
  return -1;
};

const char = int => String.fromCharCode(int);

const draw = () => {
  const inline_keyboard = [];
  const A_ascii = 65;
  const Z_ascii = 90;
  const row = 4;
  const column = 8;
  for (let i = 0; i < row; i++) {
    inline_keyboard.push([]);
    for (let j = 0; j < column; j++) {
      if (A_ascii + (column * i) + j <= Z_ascii) {
        const letter = char(A_ascii + (column * i) + j);
        inline_keyboard[i].push({ text: letter,
          callback_data:  letter });
      } else inline_keyboard[i].push({ text: ' ',
        callback_data: (' ').toString() });
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
    if (games[id].guess[i] === 1) out += games[id].word[i];
    else out += '_';
  }
  return out;
};

const win = game => {
  let is_win = 1;
  for (let i = 0; i < games[game].word.length; i++) {
    if (games[game].guess[i] === 0) is_win = 0;
  }
  return is_win;
};

const end = game => {
  const id = games[game].player2.id;
  const name = games[game].player2.name;
  games[game].player2.id = games[game].player1.id;
  games[game].player2.name = games[game].player1.name;
  games[game].player1.id = id;
  games[game].player1.name = name;
  games[game].word = '';
  games[game].guess = '';
};

bot.onText(/start|help/, msg => {
  const chat = msg.chat.id;
  bot.sendMessage(chat, `To create new game, use command /create\n 
  To join existing game, use command /join and your game ID`);
});

bot.onText(/create/, msg => {
  const chat = msg.chat.id;
  if (game_id(chat) === -1) {
    const i = games.length;
    games.push(new Game());
    games[i].status = 1;
    games[i].player1 = new Player(chat, msg.chat.username);
    bot.sendMessage(chat, 'This is your game ID: ' + i + '\n');
    bot.sendMessage(chat, 'Share this number with person, to play with.');
  } else bot.sendMessage(chat, 'Sorry, you are already playing');
});

bot.onText(/join [0-9]+/, msg => {
  const chat = msg.chat.id;
  if (game_id(chat) === -1) {
    const input_id = msg.text.slice(6);
    let yes = 0;
    while (yes === 0) {
      if (games.length > input_id && games[input_id].status === 1) {
        games[input_id].status = 2;
        games[input_id].player2 = new Player(chat, msg.chat.username);
        yes = 1;
        const player1 = games[input_id].player1;
        const player2 = games[input_id].player2;
        bot.sendMessage(chat, `Okay, you are playing with @${player1.name}`);
        bot.sendMessage(player1.id, `User @${player2.name} joined the game.
        To begin the game, use command /begin, after that type any word.`);
      } else bot.sendMessage(chat, 'Sorry, wrong ID');
    }
  } else bot.sendMessage(chat, 'Sorry, you are already playing');
});

bot.onText(/exit/, msg => {
  bot.sendMessage(msg.chat.id, 'Bye, see you later.');
  if (game_id(msg.chat.id) !== -1) {
    const game  = game_id(msg.chat.id);
    const player1 = games[game].player1;
    const player2 = games[game].player2;
    if (games[game].status === 2) {
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
    games[game].status--;
  }
});

bot.onText(/begin ([A-z]|[a-z])+/, msg => {
  if (game_id(msg.chat.id) !== -1) {
    const game = game_id(msg.chat.id);
    games[game].word = msg.text.toUpperCase().slice(7);
    games[game].guess = '0';
    const player1 = games[game].player1;
    const player2 = games[game].player2;
    for (let i = 1; i < games[game].word.length; i++) {
      games[game].guess += '0';
    }
    if (games[game].status === 2) {
      const board = draw();
      let miss = 0;
      let move = 0;
      while (miss < 6 && win(game) !== 1 && move === 0) {
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
            } else  games[game].guess += guess_old[i];
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
      if (miss === 6)
        bot.sendMessage(player2.id, `The word was ${games[game].word}.`);
      else bot.sendMessage(player2.id, 'Congratulations.');
      end(game);
      bot.sendMessage(player1.id, `To exit, type /exit\n 
      To begin new game, type /begin and any word`);
      bot.sendMessage(player1.id, `To exit, type /exit\n 
      Else, wait for the other player to choose word`);
    } else bot.sendMessage(msg.chat.id, 'You cannot play alone.');
  } else bot.sendMessage(msg.chat.id, 'You haven\'t chosen a game.');
});

