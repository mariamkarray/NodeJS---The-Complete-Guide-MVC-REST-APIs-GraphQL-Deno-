const requestHandler = (req,res) => {
    const url = req.url;
    const method = req.method;
    if (url === '/') {
        res.write('<html>')
        res.write('<head><title>Greetings</title></head>');
        res.write('<body><h1>Hello dummy users!!!</h1></body>')
        res.write(
            '<form action="/create-user" method="POST" id="h"><input type="text" name="username"><button type="submit">Add User</button></form>'
          );
        return res.end();
    }
    if (url === '/users') {
        res.write('<html>')
        res.write('<ul> <li> Mariam </li>')
        res.write('<li> Selim </li>')
        res.write('</ul> </html>')
        return res.end();
    }
    let body = [];
    if (url === '/create-user' && method === 'POST') {
       req.on('data', (chunk) => {
        body.push(chunk);
       }).on('end', () => {
        body = Buffer.concat(body).toString();
       console.log(body.split('=')[1]);
    });
    res.statusCode = 302;
    res.setHeader('Location', './');
    res.end()
}
}

exports.handler = requestHandler;