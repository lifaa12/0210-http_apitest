const http = require('http');
const { json } = require('stream/consumers');
const { v4: uuidv4 } = require("uuid");
const errorHandle = require("./errorHandle");

const todos = [];

const requestListener = (req, res) => {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
  };
  let body = "";
  req.on('data', chunk => {
    body += chunk;
  });

  if (req.url === "/todos" && req.method === "GET") {
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      "status": "success",
      data: todos
    }));
    res.end();

  } else if (req.url === "/" && req.method === "OPTIONS") {
    res.writeHead(200, headers);
    res.end();

  } else if (req.url === "/todos" && req.method === "POST") {
    req.on('end', () => {
      try {
        const { title } = JSON.parse(body);
        if (title !== undefined) {
          const todo = {
            title,
            id: uuidv4()
          };
          todos.push(todo);
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            status: "success",
            data: todo
          }));
          res.end();
        } else {
          errorHandle(res, "title");
        };
      } catch (error) {
        errorHandle(res, "other");
      };
    });

  } else if (req.url === "/todos" && req.method === "DELETE") {
    todos.length = 0;
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      status: "success",
      data: todos
    }));
    res.end();

  } else if (req.url.startsWith("/todos") && req.method === "DELETE") {
    const id = req.url.split('/').pop();
    const idx = todos.findIndex((item) => item.id === id);
    if (idx !== -1) {
      todos.splice(idx, 1);
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status: "success",
        data: todos
      }));
      res.end();
    } else {
      errorHandle(res, "刪除")
    };

  }
  else if (req.url.startsWith("/todos") && req.method === "PATCH") {
    req.on('end', () => {
      try {
        const { title } = JSON.parse(body);
        const id = req.url.split('/').pop();
        const idx = todos.findIndex((item) => item.id === id);

        if (title !== undefined && idx !== -1) {
          todos[idx].title = title;
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            status: "success",
            data: title
          }));
          res.end();
        } else {
          errorHandle(res, "title、id");
        };
      } catch (error) {
        errorHandle(res, "other");
      };
    });
  }

  else {
    res.writeHead(404, headers);
    res.write(JSON.stringify({
      "status": "error",
      "message": "無此路由"
    }));
    res.end();
  };
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3030);
