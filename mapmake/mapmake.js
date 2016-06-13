"use strict"
const BLOCK_SIZE = 32;
const WIDTH_SIZE = 640;
const HEIGHT_SIZE = 480;
const MAP_WIDTH = 40;
const MAP_HEIGHT = 15;

class SetImg{
	constructor(){
		this.TileA4 = new Image();
		this.TileA4.src = "../img/TileA4.png"
		this.TileA5 = new Image();
		this.TileA5.src = "../img/TileA5.png"
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
		this.click_x = 0;
		this.click_y = 0;
		// 押されているボタン
		this.OnButton = new Array();
		this.img = new SetImg();
		this.img = new SetImg();
		this.canvas = document.getElementById("game_main");
		this.ctx = this.canvas.getContext('2d');
		this.canvasImgL = document.getElementById("img_list");
		this.ctxImgL = this.canvasImgL.getContext('2d');
		this.frame = 0;
		this.nowSelectImgNo = 0;
		// マップデータ呼び出し
		let XHR = new XMLHttpRequest();
		XHR.open("get","../Map/map2.json",false);
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
	ClickCk(evt){
		this.click_x = evt.clientX;
		this.click_y = evt.clientY;
	}
	draw(){
		/* 画像リスト表示 */
		// 上画面
		this.ctxImgL.beginPath();
		this.ctxImgL.drawImage(this.img.TileA4,0,0);
		// 下画面
		this.ctx.beginPath();
		let grad  = this.ctx.createLinearGradient(0,0,0,480);
		grad.addColorStop(0,'rgb(100,255,255)');
		grad.addColorStop(1,'rgb(255,255,255)');
		this.ctx.fillStyle = grad;
		this.ctx.rect(0,0,640,480);
		this.ctx.fill();
		// Map描画
		for(let i=0;i<MAP_HEIGHT;i++){
			for(let j=0;j<20;j++){
				if(j>=0 && j<MAP_WIDTH){
					if(this.Map[i][j] != 0){
						this.img.drawA4(this.ctx,10,4,j * BLOCK_SIZE ,i * BLOCK_SIZE);
					}
				}
			}
		}
	}
	mainLoop(){
		// 描画
		this.draw();
		console.log("X:"+this.click_x+" Y:"+this.click_y);
	}
}
window.onload = function(){
	let Game = new GameObject();
	// ブラウザが対応しているか判定
	if (!Game.err && Game.canvasImgL.getContext){
		let gameloop = setInterval(function(){
			Game.mainLoop();
		},16);
		window.addEventListener("keyup",function(evt){
			Game.delButton(evt.keyCode);
		}, true);
		window.addEventListener("keydown",function(evt){
			Game.addButton(evt.keyCode);
		},true);
		window.addEventListener("click",function(evt){
			Game.ClickCk(evt);
		}, true);
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