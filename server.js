(()=>{
    "use strict"
    class Player{
		constructor(name){
			this.name = name;
		}
		setPosition(x,y){
			this.x = x;
			this.y = y;
		}
	}
    let express = require('express');
    let app = express();
    
    let fs = require('fs');
    let server = require('http').Server(app);
    let io = require('socket.io')(server);
    
    // IDと名前の対応リスト
    let userList = [];
    
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
		let nowPlayer = new Player("名無しさん");
		userList[socket.id] = nowPlayer;
		/*
	    socket.on('client_to_server', function(data) {
			// 名前の更新
			idToName[socket.id] = data.name;
			changeNameList(io.sockets);
		    console.log(data);
		    console.log(data.name);
		    io.sockets.emit('server_to_client', {
			    name : data.name,
			    msg : data.msg
		    });
	    });
	    */
	    socket.on('disconnect',function(data){
			console.log("ID:"+socket.id+"ログアウトしました");
			console.log(data);
			delete userList[socket.id];
		})
    });
    /*
    function changeNameList(sockets){
		console.log(idToName);
		let nowJoinStr = "現在の入室者数："+Object.keys(idToName).length+"人（";
		let count = 0;
		for(let id in idToName){
			nowJoinStr += idToName[id];
			if(++count !== Object.keys(idToName).length){
				nowJoinStr += ", ";
			}
		}
		nowJoinStr += "）";
		console.log(nowJoinStr);
		sockets.emit('sendNameList',{
			text : nowJoinStr
		});
	}
	*/
})();
