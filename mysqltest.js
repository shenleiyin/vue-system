var mysql      = require('mysql');
//创建连接得到一个对象
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'ajaxdemo'
});

//连接数据库
connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});

//执行查询操作
connection.query("SELECT * FROM admin",function (error,result) {
    console.log(result);
})