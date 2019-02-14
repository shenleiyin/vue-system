var http=require("http");
var url=require("url");
var fs=require("fs");
//引入cookie
var cookie=require("cookie");
//引入数据库
var mysql = require('mysql');
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

var querystring=require("querystring");
var app=http.createServer(function (req, res) {
var url_obj= url.parse(req.url);
if(url_obj.pathname === "/"){
    render("./template/index.html",res);
    //直接返回  不会去执行后面的代码
    return;
}
//处理注册功能
    if(url_obj.pathname === "/register" && req.method === "POST"){
    // res.write('{"name":"hello world"}');
    // res.end();
    // return;
        //接收前台发送来数据
        var user_info = '';
        req.on("data",function (chunk) {
            user_info+=chunk;
        });
        req.on("end",function (err) {
            if(!err){
                console.log(user_info);
                res.setHeader('content-type','text/html;charset=utf-8');
                var user_obj = querystring.parse(user_info);
                //判断用户名密码是否为空
                if(user_obj.username === '' || user_obj.password === ''){
                    res.write('{"status":1,"message":"用户名密码不能为空"}','utf-8');
                    res.end();
                    return;
                }
                //判断密码是否一致
                if(user_obj.password !== user_obj.repassword){
                    res.write('{"status":1,"message":"两次密码输入不一样"}','utf-8');
                    res.end();
                    return;
                }
                //把信息写入数据库
                console.log(user_obj);
                 var sql='INSERT INTO admin(username,password) VALUE("'+user_obj.username+'","'+user_obj.password+'")';
                connection.query(sql,function (error,result) {
                    //如果没有错误 并且result长度不为0  返回注册成功
                    // console.log(error);
                    // console.log(result);
                    if(!error && result && result.length !==0){
                        res.write('{"status":0,"message":"注册成功"}','utf-8');
                        res.end();
                        return;
                    }
                })
            }
        })
    }


    //处理登录的逻辑
    if(url_obj.pathname === "/login" && req.method ==="POST"){
    //接收前端发送来的数据
        var user_info='';
        req.on("data",function (chunk) {
            user_info+=chunk;
        });
        res.setHeader('content-type','text/html;charset=utf-8');
        req.on("end",function (err) {
            if(!err){
                //这里可以拿到完整的数据
                console.log(user_info);
                var user_obj = querystring.parse(user_info);
                var sql="SELECT * FROM admin WHERE username='"+user_obj.username+"' AND password='"+user_obj.password+"'";
                //把username和password拿到数据库中和已有的数据比对
                connection.query(sql,function (error,result) {
                    //console.log(result);
                    //如果说能查询出数据 说明能够登录  查不出说明不能登录
                    if(!error && result && result.length !== 0){
                        //返回成功登陆后 需要设置一个 cookie然后让带回到浏览器
                        res.setHeader('Set-Cookie',	cookie.serialize('isLogin',"true"));
                        res.write('{"status":0,"message":"登录成功"}','utf-8');
                        res.end();
                        // return;
                    }else {
                        res.write('{"status":1,"message":"用户名或者密码错误"}','utf-8');
                        res.end();
                        //return;
                    }
                })
            }
        });
        return;
    }

    //返回表格数据
    if(url_obj.pathname === "/list" && req.method === "GET"){
      //  console.log(111)
        var sql = "SELECT * FROM user";
        //链接数据库 把所有的数据都查询出来
        connection.query(sql,function (error,result) {
          //  console.log(error,result)
            if(!error && result){
                //result 数组  想办法变为字符串
                var arrstr = JSON.stringify(result);
                console.log(arrstr);
                res.setHeader('content-type','text/html;charset=utf-8');
                res.write('{"status":0,"data":'+arrstr+'}','utf-8');
                res.end();
            }
        })
        return;
    }


    //添加用户信息
    if(url_obj.pathname ==="/adduser" && req.method === "POST"){
    //接收前端传过来的数据
        var user_info='';
        req.on("data",function (chunk) {
            user_info+=chunk;
        })
        req.on("end",function (err) {
            if(!err){
                //把查询字符串 username=123&password=123 转化成对象
                var user_obj = querystring.parse(user_info);
                //写入数据
                var sql='INSERT INTO user VALUES('+null+',"'+user_obj.username+'",' +
                    '"'+user_obj.email+'","'+user_obj.phone+'","'+user_obj.qq+'")';
                //console.log(sql);
                connection.query(sql,function (error, result) {
                    res.setHeader('content-type','text/html;charset=utf-8');
                    if(!error && result && result.length !== 0){
                        res.write('{"status":0,"message":"添加成功"}','utf-8');
                        res.end();
                        return;
                    }else {
                        if(!error && result && result.length !==0){
                            res.write('{"status":1,"message":"添加失败"}','utf-8');
                            res.end();
                            return;
                        }
                    }
                })
            }
        });
        return;
    }

    //编辑用户
    if(url_obj.pathname === "/update" && req.method === "POST"){
       //接收数据
        var user_info='';
        req.on("data",function (chunk) {
            user_info+=chunk;
        })

        //更新数据
        req.on("end",function (error) {
            if(!error){
                var user_obj=querystring.parse(user_info);
                //console.log(user_obj);
                var sql = 'UPDATE user SET username="'+user_obj.username+'",email="'+user_obj.email+'",' +
                    'phone="'+user_obj.phone+'",qq="'+user_obj.qq+'" WHERE id='+Number(user_obj.id);
                connection.query(sql,function (error, result) {
                    //console.log(sql)
                    res.setHeader('content-type','text/html;charset=utf-8');
                    if(!error && result && result.length !== 0){
                        res.write('{"status":0,"message":"编辑成功"}','utf-8');
                        res.end();
                        return;
                    }else {
                        if(!error && result && result.length !==0){
                            res.write('{"status":1,"message":"编辑失败"}','utf-8');
                            res.end();
                            return;
                        }
                    }
                })
            }
        })
    }

    //删除用户
    if (url_obj.pathname === "/delete" &&  req.method ==="POST"){
    //接收到id
        var user_info = '';
        req.on("data",function (chunk) {
            user_info+=chunk;
        })
        req.on("end",function (error, result) {
            if(!error){
                var user_obj=querystring.parse(user_info);
                var sql="DELETE FROM user WHERE id="+Number(user_obj.id);
                connection.query(sql,function (error, result) {
                    //console.log(sql)
                    res.setHeader('content-type','text/html;charset=utf-8');
                    if(!error && result && result.length !== 0){
                        res.write('{"status":0,"message":"删除成功"}','utf-8');
                        res.end();
                        return;
                    }else {
                        if(!error && result && result.length !==0){
                            res.write('{"status":1,"message":"删除失败"}','utf-8');
                            res.end();
                            return;
                        }
                    }
                })
            }
        })
    }


    //获取cookie  设置cookie
    // if(url_obj.pathname === "/getcookie"){
    //     console.log(req.headers.cookie);
    //     var cookie_obj=cookie.parse(req.headers.cookie);
    //     console.log(cookie_obj)
    // }
    //
    // if(url_obj.pathname === "/setcookie"){
    //     res.setHeader('Set-Cookie',	cookie.serialize('isLogin',"true"));
    //     res.end();
    // }


    //返回admin.html 做验证
    if(url_obj.pathname === "/admin.html"){
    //获取cooki 如果有对应到登陆标志  就返回admin.html 首页  如果没有就返回错误页
        if(cookie.parse(req.headers.cookie	||	'').isLogin === "true"){
            render("./template/admin.html",res);
        }else {
            // res.write("hello");
            // res.end();
             render("./template/error.html",res);
        }
        return;
    }


    //退出登陆
    if(url_obj.pathname === "/logout"){
    //把isLogin 设置成其他
        res.setHeader('Set-Cookie',	cookie.serialize('isLogin',	""));
        render("./template/index.html",res);
        return;
    }


    render("./template"+url_obj.pathname,res);
    //pathname  -- 用户的请求 ---render
});
app.listen(3000,function (err) {
    if(!err){
        console.log("listening on 3000 ....")
    }
});
function render(path,res) {
    //binary 二进制
    fs.readFile(path,'binary',function (err, data) {
        if(!err){
            res.write(data,'binary');
            res.end();
        }
    })
}