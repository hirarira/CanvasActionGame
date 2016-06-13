"use strict"
const BLOCK_SIZE = 32;
const WIDTH_SIZE = 640;
const HEIGHT_SIZE = 480;

class Player{
	constructor(){
		this.x = 100;
		this.y = HEIGHT_SIZE - BLOCK_SIZE*2;
		this.vx = 0;
		this.vy = 0;
		this.muki = BLOCK_SIZE*2;
		this.jump = false;
		this.kaber = false;
		this.kabel = false;
	}
	restart(){
		this.x = 100;
		this.y = HEIGHT_SIZE - BLOCK_SIZE*2;
		this.vx = 0;
		this.vy = 0;
		this.muki = BLOCK_SIZE*2;
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
				if(in_x >= 0 && in_x < (WIDTH_SIZE/BLOCK_SIZE) && in_y >= 0 && in_y < (HEIGHT_SIZE/BLOCK_SIZE) ){
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
				if(in_x >= 0 && in_x < (WIDTH_SIZE/BLOCK_SIZE) && in_y >= 0 && in_y < (HEIGHT_SIZE/BLOCK_SIZE) ){
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
				if(in_x >= 0 && in_x < (WIDTH_SIZE/BLOCK_SIZE) && in_y >= 0 && in_y < (HEIGHT_SIZE/BLOCK_SIZE) ){
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
		if(this.x<0||this.x>WIDTH_SIZE-BLOCK_SIZE){
			this.vx = 0;
			if(this.x<0){
				this.x = 0;
			}
			else{
				this.x = WIDTH_SIZE-BLOCK_SIZE;
			}
		}
	}
}
class SetImg{
	constructor(){
		this.player = new Image();
		this.player.src = "./img/Actor7.png";
		this.TileA4 = new Image();
		this.TileA4.src = "./img/TileA4.png"
		this.TileA5 = new Image();
		this.TileA5.src = "./img/TileA5.png"
	}
	drawA4(ctx,im_x,im_y,x,y){
		ctx.drawImage(this.TileA4,im_x*BLOCK_SIZE,im_y*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE,
			x,y,BLOCK_SIZE,BLOCK_SIZE);
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
		// マップデータ呼び出し
		let XHR = new XMLHttpRequest();
		XHR.open("get","./Map/map.json",false);
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
	draw(){
		/* 背景グラデーション */
		this.ctx.beginPath();
		let grad  = this.ctx.createLinearGradient(0,0,0,480);
		grad.addColorStop(0,'rgb(100,255,255)');
		grad.addColorStop(1,'rgb(255,255,255)');
		this.ctx.fillStyle = grad;
		this.ctx.rect(0,0,640,480);
		this.ctx.fill();
		// Player
		if(this.player.vx != 0){
			this.player.muki = (this.player.vx > 0)?BLOCK_SIZE*2:BLOCK_SIZE;
		}
		this.ctx.drawImage(this.img.player,(Math.floor(this.frame/10)%3)*BLOCK_SIZE,this.player.muki,BLOCK_SIZE,BLOCK_SIZE,
			this.player.x,this.player.y,BLOCK_SIZE,BLOCK_SIZE);
		// Map描画
		for(let i=0;i<HEIGHT_SIZE/BLOCK_SIZE;i++){
			for(let j=0;j<WIDTH_SIZE/BLOCK_SIZE;j++){
				if(this.Map[i][j] != 0){
					this.img.drawA4(this.ctx,10,4,j * BLOCK_SIZE,i * BLOCK_SIZE);
				}
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
		if(this.frame%32 == 0){
			console.log(this.OnButton);
			console.log("X:"+this.player.x+"  Y:"+this.player.y);
		}
	}
}
window.onload = function(){
	let Game = new GameObject();
	// ブラウザが対応しているか判定
	if (!Game.err && Game.canvas.getContext){
		let gameloop = setInterval(function(){
			Game.mainLoop();
		},16);
		window.addEventListener("keyup",function(evt){
			Game.delButton(evt.keyCode)
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
}