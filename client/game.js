(()=>{
  "use strict"
  const BLOCK_SIZE = 40;
  const WINDOW_WIDTH = 20;
  const WINDOW_HEIGHT = 15;

  const WIDTH_SIZE = BLOCK_SIZE * WINDOW_WIDTH;
  const HEIGHT_SIZE = BLOCK_SIZE * WINDOW_HEIGHT;


  const MAP_WIDTH = 40;
  const MAP_HEIGHT = 15;

  const IMG_WIDTH = 10;
  const IMG_HEIGHT = 18;

  // 読み込み間隔
  const READ_SECOND = 100;

  // socket.io
  let socket = io.connect();
  let Game;
  class Player{
    constructor(){
      this.x = 64;
      this.y = HEIGHT_SIZE - BLOCK_SIZE*4;
      this.vx = 0;
      this.vy = 0;
      this.muki = 0;
      this.jump = false;
      this.kaber = false;
      this.kabel = false;
    }
    restart(){
      this.x = 64;
      this.y = HEIGHT_SIZE - BLOCK_SIZE*4;
      this.vx = 0;
      this.vy = 0;
      this.muki = 0;
    }
    keyCheck(OnButton){
      this.vx = 0;
      for(let nkey in OnButton){
        switch (OnButton[nkey]){
          //左
          case 37:
            this.vx = -4;
          break;
          //右
          case 39:
            this.vx = 4;
          break;
          // Aボタン
          case 65:
            if(!this.jump){
              this.jump = true;
              this.vy = -15;
            }
          break;
        }
      }
    }
    // 右側壁判定
    rightJudge(Map){
      this.kaber = false;
      for(let i=0;i<3;i++){
        for(let j=0;j<3;j++){
          let in_x = Math.floor(this.x/BLOCK_SIZE) + j - 1;
          let in_y = Math.floor(this.y/BLOCK_SIZE) + i - 1;
          if(in_x >= 0 && in_x < (MAP_WIDTH) && in_y >= 0 && in_y < (HEIGHT_SIZE/BLOCK_SIZE) ){
            if(Map[in_y][in_x] != 0){
              if(this.x < ( (in_x+1)*BLOCK_SIZE) && this.x > ( (in_x-1)*BLOCK_SIZE - 4) &&
                this.y < ((in_y+1)*BLOCK_SIZE) && this.y > ((in_y-1)*BLOCK_SIZE) ){
                this.kaber = true;
              }
            }
          }
        }
      }
    }
    // 左側壁判定
    leftJudge(Map){
      this.kabel = false;
      for(let i=0;i<3;i++){
        for(let j=0;j<3;j++){
          let in_x = Math.floor(this.x/BLOCK_SIZE) + j - 1;
          let in_y = Math.floor(this.y/BLOCK_SIZE) + i - 1;
          if(in_x >= 0 && in_x < (MAP_WIDTH) && in_y >= 0 && in_y < (HEIGHT_SIZE/BLOCK_SIZE) ){
            if(Map[in_y][in_x] != 0){
              if(this.x < ( (in_x+1)*BLOCK_SIZE + 4) && this.x > ( (in_x-1)*BLOCK_SIZE) &&
                this.y < ((in_y+1)*BLOCK_SIZE) && this.y > ((in_y-1)*BLOCK_SIZE) ){
                this.kabel = true;
              }
            }
          }
        }
      }
    }
    // 上下判定
    updownJudge(Map){
      for(let i=0;i<3;i++){
        for(let j=0;j<3;j++){
          let in_x = Math.floor(this.x/BLOCK_SIZE) + j - 1;
          let in_y = Math.floor(this.y/BLOCK_SIZE) + i - 1;
          if(in_x >= 0 && in_x < (MAP_WIDTH) && in_y >= 0 && in_y < (HEIGHT_SIZE/BLOCK_SIZE) ){
            if(Map[in_y][in_x] != 0){
              if(this.x < ( (in_x+1)*BLOCK_SIZE) && this.x > ( (in_x-1)*BLOCK_SIZE) &&
                this.y < ((in_y+1)*BLOCK_SIZE) && this.y > ((in_y-1)*BLOCK_SIZE) ){
                if(this.vy > 0){
                  this.jump = false;
                  this.y = (in_y-1)*BLOCK_SIZE;
                  this.vy = 0;
                }
                else{
                  this.jump = true;
                  this.vy = 1;
                  this.y = (in_y+1)*BLOCK_SIZE;
                }
              }
            }
          }
        }
      }
    }
    move(){
      if(this.vx>0 && this.kaber){
        this.vx = 0;
      }
      else if(this.vx<0 && this.kabel){
        this.vx = 0;
      }
      this.x+=this.vx;
      if(this.jump){
        this.y+=this.vy;
        this.vy++;
      }
      this.jump = true;
      if(this.y > HEIGHT_SIZE + BLOCK_SIZE){
        this.restart();
      }
      if(this.x<0||this.x>(MAP_WIDTH-1)*BLOCK_SIZE){
        this.vx = 0;
        if(this.x<0){
          this.x = 0;
        }
        else{
          this.x = (MAP_WIDTH-1)*BLOCK_SIZE;
        }
      }
    }
  }
  class SetImg{
    constructor(){
      this.wwaImg = new Image();
      this.wwaImg.src = "./openImg/island02.gif";
    }
    drawImg(img,ctx,im_x,im_y,x,y){
      ctx.drawImage(img, im_x*BLOCK_SIZE, im_y*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE,
        x, y, BLOCK_SIZE,BLOCK_SIZE);
    }
  }
  class GameObject{
    constructor(){
      this.err = false;
      this.Map = null;
      // 押されているボタン
      this.OnButton = new Array();
      this.player = new Player();
      this.img = new SetImg();
      this.canvas = document.getElementById("game_main");
      this.ctx = this.canvas.getContext('2d');
      this.gameloop = 10;
      this.frame = 0;
      // 他のプレイヤー
      this.otherPlayer = {};
      // 読み込みごとに更新するframe
      let ReadCount = 0;
      // 自分のID
      this.socketID = "";
      // マップデータ呼び出し
      let XHR = new XMLHttpRequest();
      XHR.open("get","./Map/map2.json",false);
      XHR.send(null);
      if(XHR.status == 200){
        this.Map = JSON.parse(XHR.responseText);
      }
      else{
        this.err = true;
      }
    }
    addButton(num){
      for(let nkey in this.OnButton ){
        if(this.OnButton[nkey] == num){
          return;
        }
      }
      this.OnButton.push(num);
    }
    delButton(num){
      for(let nkey in this.OnButton ){
        if(this.OnButton[nkey] == num){
          this.OnButton.splice(nkey,1);
        }
      }
    }
    drawPlayer(setX, setY, muki){
      // 主人公描画
      this.ctx.drawImage(this.img.wwaImg,((Math.floor(this.frame/10)%2)+6+(muki*2))*BLOCK_SIZE,0,BLOCK_SIZE,BLOCK_SIZE,(WIDTH_SIZE-BLOCK_SIZE)/2,setY+(BLOCK_SIZE/2),BLOCK_SIZE,BLOCK_SIZE);
      // this.ctx.drawImage(this.img.player,(Math.floor(this.frame/10)%3)*BLOCK_SIZE,muki,BLOCK_SIZE,BLOCK_SIZE,       (WIDTH_SIZE)/2-BLOCK_SIZE,setY+(BLOCK_SIZE/2),BLOCK_SIZE,BLOCK_SIZE);
    }
    drawOtherPlayer(setX, setY, muki){

    }
    draw(){
      /* 背景グラデーション */
      this.ctx.beginPath();
      let grad  = this.ctx.createLinearGradient(0,0,0,480);
      grad.addColorStop(0,'rgb(100,255,255)');
      grad.addColorStop(1,'rgb(255,255,255)');
      this.ctx.fillStyle = grad;
      this.ctx.rect(0, 0, WIDTH_SIZE, HEIGHT_SIZE);
      this.ctx.fill();
      this.ctx.fillStyle = "rgb(150,100,100)";
      // Map描画
      for(let i=0;i<MAP_HEIGHT;i++){
        for(let j=Math.floor(this.player.x/BLOCK_SIZE)-10;j<Math.floor(this.player.x/BLOCK_SIZE)+14;j++){
          if(j>=0 && j<MAP_WIDTH){
            if(typeof this.Map[i][j] === "undefined" || this.Map[i][j] === null){
              this.ctx.fillRect(j*BLOCK_SIZE-this.player.x+(WIDTH_SIZE-BLOCK_SIZE)/2, i*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
            if(this.Map[i][j] !== 0){
              let nowx = (this.Map[i][j] - 100)%IMG_WIDTH;
              let nowy = Math.floor((this.Map[i][j] - 100)/IMG_WIDTH);
              this.img.drawImg(this.img.wwaImg, this.ctx, nowx, nowy, j*BLOCK_SIZE-this.player.x+(WIDTH_SIZE-BLOCK_SIZE)/2, i*BLOCK_SIZE);
            }
          }
        }
      }
      // Player
      if(this.player.vx != 0){
        this.player.muki = (this.player.vx > 0)?1:0;
      }
      this.drawPlayer(this.player.x, this.player.y, this.player.muki);
      // 他プレイヤー描画
      for(let i in this.otherPlayer){
        // 自プレイヤーかどうか判定
        if(i !== this.socketID){
          // 他プレイヤーの位置は1000msごとに読みこむが
          // 20msごとに前回読み込んだ際の位置から軌跡を描画する。
          let show_x = Math.floor((this.otherPlayer[i].x - this.otherPlayer[i].bx)*this.ReadCount/(READ_SECOND/20));
          let show_y = Math.floor((this.otherPlayer[i].y - this.otherPlayer[i].by)*this.ReadCount/(READ_SECOND/20));
          let draw_x = this.otherPlayer[i].bx - this.player.x + (WIDTH_SIZE-BLOCK_SIZE)/2 + show_x;
          // ちょっと沈ませて描画
          let draw_y = Number(this.otherPlayer[i].by) + show_y + (BLOCK_SIZE/2);
          // this.ctx.drawImage(this.img.player,(Math.floor(this.frame/10)%3)*BLOCK_SIZE,this.otherPlayer[i].muki,BLOCK_SIZE,BLOCK_SIZE, draw_x,draw_y,BLOCK_SIZE,BLOCK_SIZE);
          this.ctx.drawImage(this.img.wwaImg,((Math.floor(this.frame/10)%2)+6+(this.otherPlayer[i].muki*2))*BLOCK_SIZE,0,BLOCK_SIZE,BLOCK_SIZE,draw_x,draw_y,BLOCK_SIZE,BLOCK_SIZE);
          // 名前表示
          this.ctx.fillStyle = "red";
          this.ctx.fillText(this.otherPlayer[i].name,draw_x,draw_y-10);
          // メッセージ表示
          this.ctx.beginPath();
          let str_length = this.otherPlayer[i].message.length * 10 + 20;
          this.ctx.fillStyle = "white";
          this.ctx.fillRect(draw_x-10,draw_y-55,str_length,20);
          this.ctx.strokeRect(draw_x-10,draw_y-55,str_length,20);
          this.ctx.fillStyle = "black";
          this.ctx.fillText(this.otherPlayer[i].message,draw_x,draw_y-40);
        }
      }
    }
    mainLoop(){
      // 入力キーチェック
      this.player.keyCheck(this.OnButton)
      // 右側壁チェック
      this.player.rightJudge(this.Map);
      // 左側壁チェック
      this.player.leftJudge(this.Map);
      // プレイヤー動作
      this.player.move();
      // 上下壁チェック
      this.player.updownJudge(this.Map)
      // 描画
      this.draw();
      // フレームカウント増大
      this.frame++
      this.ReadCount++
      /*
      if(this.frame%32 == 0){
        console.log(this.OnButton);
        console.log("X:"+this.player.x+"  Y:"+this.player.y);
      }
      */
    }
    // 他プレイヤーの処理
    setOtherPlayer(data){
      this.otherPlayer = data;
    }
  }

  // Serverからのデータ受信
  socket.on("serverToClient",(data)=>{
    if(Game !== undefined){
      Game.setOtherPlayer(JSON.parse(data.playerList ) );
      Game.ReadCount = 0;
    }
  });
  // 自分のsocketIDを取得
  socket.on("sendMyUserID",(data)=>{
    console.log(data);
    if(Game !== undefined){
      Game.socketID = data.myID;
      console.log(Game.socketID);
    }
  });
  // Serverにデータを送信
  function sendServer(Game){
    let playerName = $("#nameForm").val();
    let playerMessage = $("#messageForm").val();
    socket.emit("clientToServer", {
      Player : Game.player,
      playerName : playerName,
      playerMessage : playerMessage
    });
  }
  window.addEventListener("load",(eve)=>{
    Game = new GameObject();
    // ブラウザが対応しているか判定
    if (!Game.err && Game.canvas.getContext){
      // 自分のユーザIDを取得要請
      socket.emit("requestMyUserID", {
      });
      // 16msごとにループ
      // 62.5fps
      let gameloop = setInterval(function(){
        Game.mainLoop();
      },16);
      // 500msごとにサーバにデータを送る
      let sendServerResult = setInterval(function(){
        sendServer(Game);
      },READ_SECOND);

      window.addEventListener("keyup",function(evt){
        Game.delButton(evt.keyCode);
      }, true);
      window.addEventListener("keydown",function(evt){
        Game.addButton(evt.keyCode);
      },true);
    }
    else{
      Game.ctx.beginPath();
      Game.ctx.fillStyle = "rgb(0,0,0)";
      Game.ctx.fillRect(0,0,WIDTH_SIZE,HEIGHT_SIZE);
      Game.ctx.font = "36px 'ＭＳ Ｐゴシック'";
      Game.ctx.fillStyle = "red";
      Game.ctx.fillText("マップデータが読み込めません",100,HEIGHT_SIZE/2);
    }
  },false);
})();
