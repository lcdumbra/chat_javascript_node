const app = require('express')()
 
const http = require('http').createServer(app)
 
var io = require('socket.io')(http)

var usuarios = [];

http.listen(3000, function(){
  console.log('listening on port 3000')
 })

var express = require('express');
app.use(express.static(__dirname))

app.get('/', (req, res)=>{
      res.sendFile(__dirname+'/index.html')
})

io.on("connection", function(socket){
	socket.on("entrar", function(apelido, callback){
         if(!(apelido in usuarios)){
           socket.apelido = apelido;
           usuarios[apelido] = socket;

         io.sockets.emit("atualizar usuarios", Object.keys(usuarios));
         io.sockets.emit("atualizar mensagens", "[ " + pegarDataAtual() + " ] " + apelido + " acabou de entrar na sala");

           callback(true);
         }else{
              callback(false);
         }
     });
     socket.on("enviar mensagem", function(dados, callback){
     	 var mensagem_enviada = dados.msg;
         var usuario = dados.usu;
         if(usuario == null)
           usuario = '';
         mensagem_enviada = "[ " + pegarDataAtual() + " ] " + socket.apelido + " diz: " + mensagem_enviada;
  
         if(usuario == ''){
              io.sockets.emit("atualizar mensagens", mensagem_enviada);
         }else{
              socket.emit("atualizar mensagens", mensagem_enviada);
              usuarios[usuario].emit("atualizar mensagens", mensagem_enviada);
         }
         callback();
     });
     socket.on("disconnect", function(){
         delete usuarios[socket.apelido];
         io.sockets.emit("atualizar usuarios", Object.keys(usuarios));
         io.sockets.emit("atualizar mensagens", "[ " + pegarDataAtual() + " ] " + socket.apelido + " saiu da sala");
     });
});
function pegarDataAtual(){
  var dataAtual = new Date();
  var dia = (dataAtual.getDate()<10 ? '0' : '') + dataAtual.getDate();
  var mes = ((dataAtual.getMonth() + 1)<10 ? '0' : '') + (dataAtual.getMonth() + 1);
  var ano = dataAtual.getFullYear();
  var hora = (dataAtual.getHours()<10 ? '0' : '') + dataAtual.getHours();
  var minuto = (dataAtual.getMinutes()<10 ? '0' : '') + dataAtual.getMinutes();
  var segundo = (dataAtual.getSeconds()<10 ? '0' : '') + dataAtual.getSeconds();
  
  var dataFormatada = dia + "/" + mes + "/" + ano + " " + hora + ":" + minuto + ":" + segundo;
  return dataFormatada;
}