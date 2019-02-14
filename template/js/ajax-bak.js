/*
method,请求的方法
url,请求的地址
data,发送的数据
success，数据请求成功后，要处理的义务逻辑 就是一个函数块
return  undefined
*/
//
function ajax(options) {
    //给method 默认值 默认get
    var method = options.method || 'get';
    //发送请求
    var xhr = null;
//try  catch finally
    try {
        xhr = new XMLHttpRequest();
    } catch (e) {
        //e try里面报的错会放在这个 e 这个参数里
        xhr = new ActiveXObject('Microsoft.XMLHTTP');

    }
    if (method === 'get') {
        //打开一个请求的地址
        xhr.open('get', options.url + "?" + options.data, true);
        // xhr.setRequestHeader('content-type','application/x-www-form-urlencoded');
        //发送亲请求  get方式数据在查询数据中  post数据在请求体中
        xhr.send();
    } else if (method === 'post') {

        xhr.open('post', options.url, true);
        xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
        xhr.send(options.data);
    } else {
        console.log("请求方式不正确")
    }
//监听readystate 状态 4 表示数据返回成功 可以使用
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            //alert(xhr.responseText);
            //responseText  是文本格式 字符串类型  解析成对象后才能使用
            var arr = JSON.parse(xhr.responseText);
            //console.log(arr.title);
//success=function (data) {
//                 var oul = document.getElementById('ul1');
//                 //创建li 把数据放到li里面去
//                 for (var i=0 ; i<data.length ; i++){
//                     var oli=document.createElement('li');
//                     oli.innerHTML= arr[i].name+arr[i].age;
//                     oul.appendChild(oli);
//                 }
            options.success && options.success(arr);

        }

    }
}

