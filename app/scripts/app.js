var User = function () {
  return {
      setStatus : function (message) {
          $('#status').hide();
          $('#status').val('');
          $('#current-status').text(message);
          $('#current-status').show();
          $('#delete-status').show();
          $('#search-confederate').show();
      }
  }
};
$(document).ready(function(){
    var user = new User();
    var socket = io.connect("http://fripple.ru:3003/");
    socket.emit('load messages', {user : window.username});
    socket.on('show messages', function(data) {
        $('#confederate-list').hide();
        $('#messages-list').show();
        for (var i in data){
            $('#messages-list').prepend('<p>'+data[i].message+'</p>');
        }
        console.log(data);
    });
    socket.on('set status', function(data){
        user.setStatus(data.message);
    });
    $('#status').on('keypress', function (e) {
        if (e.which == 13) {
            var message = $('#status').val();
            e.preventDefault();
            socket.emit('send message', {
                message: message,
                user : window.username,
                screen_name : window.name
            });
            user.setStatus(message);
        }
    });

    $('#delete-status').click(function(){
        $('#status').show();
        $('#delete-status').hide();
        $('#search-confederate').hide();
        $('#messages-list').prepend('<p>'+$('#current-status').text()+'</p>');
        $('#current-status').text('');
        $('#current-status').hide();
        socket.emit('close status',{user: window.username});
    });
    $('#search-confederate').click(function(){
        socket.emit('search confederate', {
            message: $('#current-status').text(),
            user: window.username,
            screen_name: window.name
        });
        $('#search-confederate').hide()
        $('#show-history').show();
    });
    $('#show-history').click(function(){
        $('#search-confederate').show()
        $('#confederate-list').hide();
        $('#messages-list').show();
        $('#show-history').hide()
    });
    socket.on("show results",function(data){
        $('#confederate-list').show();
        $('#messages-list').hide();
        $('#confederate-list').html('');
        for (var i in data){
            $('#confederate-list').append(
                "<p><a href='http://twitter.com/"+data[i].screen_name+"'>"+
                    data[i].name+'</a> : '+data[i].message+
                "</p>")
        }
        console.log(data)
    })
});