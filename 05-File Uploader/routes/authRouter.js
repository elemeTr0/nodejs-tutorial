const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const isAuthenticated = require("../middleware/isAuthenticated");

const prisma = new PrismaClient();
const authRouter = Router();
const upload = multer({ dest: "uploads/" });

authRouter.get("/sign-up", (req, res) => {
    res.send(`
        <form method="POST" action="/sign-up"> 
        <input name="username" placeholder="Username">
        <input name="password" type="password" placeholder="password">
        <button type="submit">Sign up</button>
        </form>`);
});

authRouter.post("/sign-up", async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
        },
    });

    res.send("User created!");
});

authRouter.get("/log-in", (req, res) => {
    res.send(`
        <form method="POST" action="/log-in"> 
        <input name="username" placeholder="Username">
        <input name="password" type="password" placeholder="password">
        <button type="submit">Log in</button>
        </form>`);
});

authRouter.post(
    "/log-in",
    passport.authenticate("local", {
        successRedirect: "/profile",
        failureRedirect: "/log-in",
    }),
);

authRouter.get("/profile", isAuthenticated, (req, res) => {
    res.send(`
  Logged in as ${req.user.username}
  <a href="/upload">Upload a file</a>

  <form method="POST" action="/log-out">
    <button type="submit">Log out</button>
  </form>
`);
});

authRouter.post("/log-out", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }

            res.redirect("/log-in");
        });
    });
});

authRouter.get("/upload", isAuthenticated, async (req, res) => {
    const folders = await prisma.folder.findMany({
        where: {
            userId: req.user.id,
        },
    });

    res.send(`
        <form method="POST" action="/upload" enctype="multipart/form-data">
            <input type="file" name="file">

            <select name="folderId">
                <option value="">No folder</option>

                ${
                    folders.map(folder =>
                        `<option value="${folder.id}">${folder.name}</option>`
                    ).join("")
                }
            </select>

            <button type="submit">Upload</button>
        </form>
    `);
});

authRouter.post(
    "/upload",
    isAuthenticated,
    upload.single("file"),
    async (req, res) => {
        const result = await prisma.file.create({
            data: {
    name: req.file.originalname,
    path: req.file.path,
    size: req.file.size,
    type: req.file.mimetype,
    userId: req.user.id,
    folderId: req.body.folderId
        ? Number(req.body.folderId)
        : null,
},
        });

        res.redirect("/files");
    },
);

authRouter.get("/files", isAuthenticated, async (req, res) => {
    const folders = await prisma.folder.findMany({
        where: {
            userId:req.user.id,
        }
    })
    const files = await prisma.file.findMany({
        where: {
            userId: req.user.id,
            folderId: null
        },
    });

    res.send(`<a href="/folder/create">Create a folder</a><a href="/upload">Upload a file</a>
        <h1> Your Files </h1>
        ${
            files.map((file) =>
            `<div>
            <p>${file.name}</p>
            <p>Type: .${file.type}</p>
            <p>Size: ${file.size} bytes</p>

            <a href="/files/${file.id}/download">Download</a>

            <form method="POST" action="/files/${file.id}/delete">
            <button type="submit">Delete</button>
            </form>
            </div>`,
            )
            .join("")}
            <h1> Your Folders </h1>
        ${
            folders.map((folder) =>
            `<div>
            <p>${folder.name}</p>

            <a href="/folder/${folder.id}/content">Open folder</a>

            <form method="POST" action="/folder/${folder.id}/delete">
            <button type="submit">Delete</button>
            </form>
            </div>`,
            )
            .join("")}
            `);
});

authRouter.post("/files/:id/delete", isAuthenticated, async (req, res) => {
    const file = await prisma.file.findFirst({
        where: {
            id: Number(req.params.id),
            userId: req.user.id,
        },
    });

    if (!file) {
        return res.status(404).send("File not found");
    }

    await prisma.file.delete({
        where: {
            id: file.id,
        },
    });

    res.redirect("/files");
});

authRouter.get("/files/:id/download", isAuthenticated, async (req, res) => {
    const file = await prisma.file.findUnique({
        where: {
            id: Number(req.params.id),
        },
    });

    if (!file) {
        return res.status(404).send("File not found");
    }

    res.download(file.path, file.name);
});

authRouter.get("/folder/create", isAuthenticated, (req, res) => {
    res.send(`
        <h1>Create Folder</h1>

        <form method="POST" action="/folder/create">
            <input name="name" placeholder="Folder name">
            <button type="submit">Create</button>
        </form>
    `);
});

authRouter.post("/folder/create", isAuthenticated, async (req, res) => {
    await prisma.folder.create({
        data: {
            name: req.body.name,
            userId: req.user.id,
        },
    });

    res.redirect("/files");
});

authRouter.get("/folder/:id/content", isAuthenticated, async (req,res)=>{
    const files = await prisma.file.findMany({
        where:{
            folderId: Number(req.params.id),
        }
    })

    const folderName = await prisma.folder.findFirst({
        where:{
            id: Number(req.params.id),
        }
    })

    res.send(`
        <h1> Folder ${folderName.name} </h1>
        ${
            files.map((file) =>
            `
            <div>
            <p>${file.name}</p>
            <p>Type: .${file.type}</p>
            <p>Size: ${file.size} bytes</p>

            <a href="/files/${file.id}/download">Download</a>

            <form method="POST" action="/files/${file.id}/delete">
            <button type="submit">Delete</button>
            </form>
            </div>`,
            )
            .join("")}
            `)
        });

authRouter.post("/folder/:id/delete", isAuthenticated, async (req, res) => {
    const folder = await prisma.folder.findFirst({
        where: {
            id: Number(req.params.id),
            userId: req.user.id,
        },
    });

    if (!folder) {
        return res.status(404).send("Folder not found");
    }

    const files = await prisma.file.findFirst({
        where: {
            folderId: folder.id,
        },
    });

    if (files) {
        return res.status(400).send("Folder is not empty");
    }

    await prisma.folder.delete({
        where: {
            id: folder.id,
        },
    });

    res.redirect("/files");
});

module.exports = authRouter;
