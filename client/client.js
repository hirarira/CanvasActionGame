(()=>{
	"use strict";
	let socket = io.connect();
	/*
	// サーバからクライアントにデータが送信されてきた時に処理を行う
	socket.on("server_to_client", function(data){
		console.log(data);
		appendMsg(data)
	});
	// サーバから送信された入室者リストの反映
	socket.on("sendNameList",(data)=>{
		$('#nowPerson').html('');
		$('#nowPerson').append(data.text);
	});
	// サーバから送信されてきた新しい投稿を反映する
	function appendMsg(text) {
		$("#chatLogs").append("<p>" + text.name+" : "+ text.msg + "</p>");
	}
	$("form").submit(function(e){
		let name = $("#nameForm").val();
		let msg = $("#msgForm").val();
		$("#msgForm").val('');
		// クライアントからサーバにデータを送信する。
		socket.emit("client_to_server", {
			name : name,
			msg : msg
		});
		e.preventDefault();
	});
	*/
	window.addEventListener("load",(eve)=>{
			console.log("test");
			
	},false);
	function test(){
		console.log("aaa");
	}
})();

