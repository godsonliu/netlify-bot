const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3001;
const feishu = process.env.FEISHU;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.end("Hello World!");
});

app.post("/", async (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  let { state, id, name, title, commit_url, error_message } = req.body;
  console.log(JSON.stringify(req.body));
  console.log(`${name} --- ${title} --- ${commit_url}`);
  let url;
  try {
    url = JSON.parse(feishu);
  } catch (e) {}

  if (!url) {
    res.end("feishu is not set");
    return;
  }

  if (typeof url === "object") {
    url = url[name];
  }

  if (!url) {
    res.end("feishu is not match");
    return;
  }

  title = title || "手动部署成功";
  let content = "😀 eufy | 代码发布成功";

  if (state === "error") {
    content = "😵 eufy | 代码发布失败";
    title = error_message;
  }

  if (!commit_url || state === "error") {
    commit_url = `https://app.netlify.com/teams/anker-dtc/builds/${id}`
  }

  await axios.post(url, {
    msg_type: "interactive",
    card: {
      elements: [
        {
          tag: "div",
          text: { content: title, tag: "lark_md" },
        },
        {
          actions: [
            {
              tag: "button",
              text: { content: "详情👀", tag: "lark_md" },
              url: commit_url,
              type: "default",
              value: {},
            },
          ],
          tag: "action",
        },
      ],
      header: {
        title: { content, tag: "plain_text" },
      },
    },
  });

  res.end("success");
});

const server = app.listen(port, () =>
  console.log(`app listening on port ${port}!`)
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
