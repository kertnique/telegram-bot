let TelegramBot = require('node-telegram-bot-api');

class Game{
    construsctor(status, player1_id,player2_id,player1_name,player2_name,word,guess){
        this.status = status;
        this.player1_id = player1_id;
        this.player2_id = player2_id;
        this.player1_name=player1_name;
        this.player2_name=player2_name;
        this.word=word;
        this.guess=guess;
    }
};

let token = "1122460821:AAEvt2V7-zz6dKuSScXAKCeKJP6Wk2m54_c";
let bot = new TelegramBot(token, {polling: true});
let games = [];


let  game_id =(id) =>{
    for(let i=games.length-1;i>=0;i--){
        if(games[i].status!=0){
            if(games[i].player1_id==id||games[i].player2_id==id) return i;
        }
    }
    return -1;
}

let output = (id) =>{
    let out = '';
    for(let i=0;i<games[id].word.length;i++){
        if(games[id].guess[i]==1) out+=games[id].word[i];
        else out+='_';
    }
    return out;
}

let win = (game) =>{
    let is_win=1;
      for(let i =0 ;i<games[game].word.length;i++){
          if(games[game].guess[i]==0) is_win=0;
      }  
      return is_win;
}

let end = (game) =>{
    let id =games[game].player2_id;
        let name = games[game].player2_name;
        games[game].player2_id=games[game].player1_id;
        games[game].player2_name=games[game].player1_name;
        games[game].player1_id=id;
        games[game].player1_name=name;
        games[game].word='';
        games[game].guess='';
}

bot.onText(/start|help/,function (msg){
    let chat = msg.chat.id;
    bot.sendMessage(chat,"To create new game, use command /create\n To join existing game, use command /join and your game ID");
});

bot.onText(/create/,function (msg){
    let chat = msg.chat.id;
    if(game_id(chat)==-1){
        let i=games.length;
        games.push(new Game());
        games[i].status=1;
        games[i].player1_id=chat;
        games[i].player1_name=msg.chat.username;
        bot.sendMessage(chat,"This is your game ID: "+ i +"\n Please share this number with person, you want to play with.");
    }
    else bot.sendMessage(chat, "Sorry, you are already playing");
});

bot.onText(/join [0-9]+/,function(msg){
    let chat=msg.chat.id;
    if(game_id(chat)==-1){
    let input_id = msg.text.slice(6);
    let yes=0;
     while(yes==0){
            if(games.length>input_id&&games[input_id].status==1){
                games[input_id].status=2;
                games[input_id].player2_id=chat;
                games[input_id].player2_name=msg.chat.username;
                yes=1;
                bot.sendMessage(chat,"Okay, you are playing with @"+games[game_id(chat)].player1_name);
                bot.sendMessage(games[game_id(chat)].player1_id,"User @"+games[game_id(chat)].player2_name+" joined the game.\n To begin the game, use command /begin, after that type any word.");
            }
            else bot.sendMessage(chat, "Sorry, wrong ID");
        }
    }
    else bot.sendMessage(chat, "Sorry, you are already playing");
});

bot.onText(/exit/,function(msg){
    bot.sendMessage(msg.chat.id,"Bye, see you later.");
    if(game_id(msg.chat.id)!=-1){
        let play  =game_id(msg.chat.id);
        if(games[play].status==2){
            if(msg.chat.id==games[play].player1_id){
                bot.sendMessage(games[play].player2_id,"Sorry, player @"+msg.chat.username+" left the game.");
                games[play].player1_id=games[play].player2_id;
                games[play].player1_name=games[play].player2_name;
                games[play].player2_id=0;
                games[play].player2_name='';
            }
            else{
                bot.sendMessage(games[play].player1_id,"Sorry, player @"+msg.chat.username+" left the game.");
                games[play].player2_id=0;
                games[play].player2_name='';
            }
        }
        games[play].status--;    
    }
});

bot.onText(/begin ([A-z]|[a-z])+/,function(msg){
    if(game_id(msg.chat.id)!=-1){
        let game = game_id(msg.chat.id);
         games[game].word=msg.text.toUpperCase().slice(7);
         games[game].guess='0';
            for(let i=1;i<games[game].word.length;i++){
                games[game].guess+='0';
            }    
        if(games[game].status==2){
 
        let inline_keyboard = [];
      for (let i = 0; i < 4; i++) {
        inline_keyboard.push([]);
        for (let j = 0; j < 8; j++) {
            if(65+(8*i)+j<91)
           inline_keyboard[i].push({ text: String.fromCharCode(65+(8*i)+j), callback_data:  String.fromCharCode(65+(8*i)+j)});
            else inline_keyboard[i].push({ text: ' ', callback_data: (' ').toString()});
        }
      }
      for(let i=0;i<inline_keyboard.length;i++)
        board = {
        reply_markup: JSON.stringify({inline_keyboard})
        }   
        let miss = 0;
        let move =0;
        while(miss<6&&win(game)!=1&&move==0){
            let letter;
            bot.sendMessage(games[game].player2_id,"Please choose a letter",board);
            move=1;
            bot.on('callback_query',(query) => {
                if(query.data!=undefined){
                 letter = query.data;
                    move=0;
                }
                let move_hit = 0;
                let guess_old = games[game].guess;
                games[game].guess=guess_old[0];
                if(games[game].word[0]==letter) games[game].guess='1';
                for(let i=1;i<games[game].word.length;i++){
                    if(games[game].word[i]==letter){
                        games[game].guess+='1';
                        move_hit=1;
                    }
                    else  games[game].guess+=guess_old[i];
                }
                if(move_hit==0){ 
                    bot.sendMessage(games[game].player2_id,'You have missed.');
                    miss++;
                }
                    bot.sendMessage(games[game].player1_id,`Player choosed letter ${letter}.\n${output(game)}`);
                bot.sendMessage(games[game].player2_id,output(game)); 
            });
        }
        if(miss==6) bot.sendMessage(games[game].player2_id,`You have lost, the word was ${games[game].word}.`);
        else bot.sendMessage(games[game].player2_id,'Congratulations.');
        end(game);
        bot.sendMessage(games[game].player1_id,`To exit, type /exit\n To begin new game, type /begin and any word`);
        bot.sendMessage(games[game].player1_id,`To exit, type /exit\n Else, wait for the other player to choose word`);
        
    }
    else bot.sendMessage(msg.chat.id,"You cannot play alone.");
    }
    else bot.sendMessage(msg.chat.id,"You haven't chosen a game.");
});

