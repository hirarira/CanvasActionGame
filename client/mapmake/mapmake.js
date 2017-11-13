(()=>{
	"use strict"
	const BLOCK_SIZE = 32;
	const WIDTH_SIZE = 640;
	const HEIGHT_SIZE = 480;
	const MAP_WIDTH = 40;
	const MAP_HEIGHT = 15;

	// socket.io
	let socket = io.connect();

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
			this.doClick = false;
			this.SImgX = 0;
			this.SImgY = 0;
			this.scrollX = 0;
			
			// 押されているボタン
			this.OnButton = new Array();
			this.img = new SetImg();
			this.canvas = document.getElementById("game_main");
			this.ctx = this.canvas.getContext('2d');
			
			this.canvasns = document.getElementById("now_img");
			this.ctxns = this.canvasns.getContext('2d');
			
			this.canvasImgL = document.getElementById("img_list");
			this.ctxImgL = this.canvasImgL.getContext('2d');
			this.frame = 0;
			this.nowSelectImgNo = 100;
			
			// 文字設定
			this.ctx.font = "14px 'ＭＳ Ｐゴシック'";
			this.ctx.strokeStyle = "red";
			
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
			if(evt.button == 0){
				this.doClick = true;
				this.click_x = evt.clientX;
				this.click_y = evt.clientY;
			}
			else if(evt.button == 1){
				this.nowSelectImgNo = 0;
			}
		}
		MouseUpCk(evt){
			if(evt.button == 0){
				this.doClick = false;
			}
		}
		MMoveCk(evt){
			if(this.doClick){
				this.click_x = evt.clientX;
				this.click_y = evt.clientY;
			}
		}
		SelectImg(){
			let gmo = this.canvasImgL.getBoundingClientRect();
			let nowX = this.click_x - gmo.left;
			let nowY = this.click_y - gmo.top;
			if(nowX >= 0 && nowX < 32 * 12 && nowY >= 0 && nowY < 32 * 24){
				this.SImgX = Math.floor(nowX/32);
				this.SImgY = Math.floor(nowY/32);
				this.nowSelectImgNo = 100 + this.SImgX + (this.SImgY * 12);
			}
			$(document).on("click","#clearMode",() => {
				this.nowSelectImgNo = 0;
			});
		}
		SetImg(){
			let gmo = this.canvas.getBoundingClientRect();
			let nowX = Math.floor((this.click_x - gmo.left)/32);
			let nowY = Math.floor((this.click_y - gmo.top)/32);
			// console.log("X:"+nowX+" Y:"+nowY+" NOW:"+this.nowSelectImgNo);
			if(nowX >= 0 && nowX < 20 && nowY >= 0 && nowY < 15){
				this.Map[nowY][(nowX+this.scrollX)] = this.nowSelectImgNo;
			}
		}
		moveMap(){
			for(let nkey in this.OnButton ){
				if(this.OnButton[nkey] == 37){
					this.scrollX--;
					return;
				}
				else if(this.OnButton[nkey] == 39){
					this.scrollX++;
					return;
				}
			}
			
		}
		draw(){
			/* 画像リスト表示 */
			// 上画面
			this.ctxImgL.beginPath();
			this.ctxImgL.drawImage(this.img.TileA4,0,0);
			// 現在選択中のパーツと番号を描画
			this.ctxns.beginPath();
			if(this.nowSelectImgNo !== 0){
				this.img.drawA4(this.ctxns,this.SImgX,this.SImgY,0,0);
			}else{
				this.ctxns.fillRect(0, 0, BLOCK_SIZE, BLOCK_SIZE);
			}
			$('#now_select').empty();
			$('#now_select').append(this.nowSelectImgNo);
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
					let snowX = this.scrollX + j;
					if(snowX>=0 && snowX<WIDTH_SIZE){
						if(this.Map[i][snowX] != 0){
							let nowx = (this.Map[i][snowX] - 100)%12;
							let nowy = Math.floor((this.Map[i][snowX] - 100)/12);
							this.img.drawA4(this.ctx,nowx,nowy,j * BLOCK_SIZE ,i * BLOCK_SIZE);
						}
						// マップの枠描画
						this.ctx.strokeRect(j * BLOCK_SIZE, i* BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
						// マップのパーツ番号描画
						this.ctx.strokeText(this.Map[i][snowX],j * BLOCK_SIZE, (i + 0.7)* BLOCK_SIZE);
					}
				}
			}
		}
		mainLoop(){
			this.SelectImg();
			if(this.doClick === true){
				this.SetImg();
			}
			this.moveMap();
			// 描画
			this.draw();
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
			window.addEventListener("mousemove",function(evt){
				Game.MMoveCk(evt);
			}, true);
			window.addEventListener("mousedown",function(evt){
				Game.ClickCk(evt);
			}, true);
			window.addEventListener("mouseup",function(evt){
				Game.MouseUpCk(evt)
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
		$(document).on("click","#saveMap",() => {
			socket.emit("saveMapJSON", {
				mapData : Game.Map
			});
		});
	}
})();
