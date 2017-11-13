(()=>{
    "use strict"
    class Player{
		setPosition(x,y,muki){
			this.bx = this.x;
			this.by = this.y;
			this.x = x;
			this.y = y;
			this.muki = muki;
		}
		setName(name){
			this.name = name;
		}
		setMessage(message){
			this.message = message;
		}
	}
    let express = require('express');
    let app = express();
    
    let fs = require('fs');
    let server = require('http').Server(app);
    let io = require('socket.io')(server);
    
    // IDと名前の対応リスト
    let playerList = {};
    
    // clientフォルダを使えるようにする
    app.use(express.static('client'));
		
    app.get('/', (req, res)=>{
		console.log(__dirname);
		res.sendfile(__dirname + '/client/index.html');
	});
    server.listen(3000, ()=>{
		console.log("server running in 3000");
	});
    
    io.on('connection', function(socket) {
		console.log("ID:"+socket.id+"がログインしました。");
		let nowPlayer = new Player();
		playerList[socket.id] = nowPlayer;
	    // クライアントからの情報取得
	    socket.on('clientToServer', function(data) {
			// プレイヤー情報の格納
			playerList[socket.id].setPosition(data.Player.x, data.Player.y, data.Player.muki);
			playerList[socket.id].setName(data.playerName);
			playerList[socket.id].setMessage(data.playerMessage);
			let sendPlayerList = JSON.stringify(playerList);
			// クライアントに向けて送信
			io.sockets.to(socket.id).emit('serverToClient',{
				playerList : sendPlayerList
			});
		});
		// クライアントから自分のIDをリクエスト
		socket.on('requestMyUserID', function(data) {
			// クライアントに自分のIDを通達
			io.sockets.to(socket.id).emit('sendMyUserID',{
				myID : socket.id
			});
		});
	    socket.on('disconnect',function(data){
			console.log("ID:"+socket.id+"ログアウトしました");
			console.log(data);
			delete playerList[socket.id];
		});
		// クライアントからマップのSAVE要請
		socket.on('saveMapJSON', function(data) {
			let outputData = JSON.stringify(data.mapData);
			fs.writeFile("./client/Map/map2.json",outputData, (err)=>{
				console.log(err);
			});
			/*
			// クライアントに自分のIDを通達
			io.sockets.to(socket.id).emit('resSaveRes',{
				result : "OK"
			});
			*/
			
		});
    });
})();
