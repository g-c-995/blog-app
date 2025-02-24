const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const postsFilePath = path.join(__dirname, "posts.json");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const readPosts = () => {
    try {
        const data = fs.readFileSync(postsFilePath, "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading posts file:", err);
        return [];
    }
};
const writePosts = (posts) => {
    fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2), "utf8");
};

app.get("/", (req, res) => {
    const posts = readPosts();
    res.render("home", { posts });
});
app.get("/add", (req, res) => {
    res.render("addpost");
});

app.post("/add-post", (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).send("Title and content are required.");
    }

    const posts = readPosts();
    const newPost = { id: posts.length + 1, title, content };
    posts.push(newPost);
    writePosts(posts);

    res.redirect("/");
});

app.get("/post", (req, res) => {
    const postId = parseInt(req.query.id);
    const posts = readPosts();
    const post = posts.find(p => p.id === postId);

    if (!post) {
        return res.status(404).send("Post not found.");
    }
    res.render("post", { post });
});

app.delete("/delete-post", (req, res) => {
    const postId = parseInt(req.query.id);
    let posts = readPosts();

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) {
        return res.status(404).json({ error: "Post not found." });
    }

    posts.splice(postIndex, 1);
    writePosts(posts);

    res.status(200).json({ message: "Post deleted successfully" });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
