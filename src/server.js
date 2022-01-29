import "dotenv/config";
import express from "express";
import http from "http";
import SocketIO from "socket.io";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
	cosr: {
		origin: ["https://admin.socket.io"],
		credentials: true,
	},
});
instrument(wsServer, {
	auth: false,
});

wsServer.on("connection", (socket) => {
	socket.on("join_room", (roomName) => {
		socket.join(roomName);
		socket.to(roomName).emit("welcome");
	});
	socket.on("offer", (offer, roomName) => {
		socket.to(roomName).emit("offer", offer);
	});
	socket.on("answer", (answer, roomName) => {
		socket.to(roomName).emit("answer", answer);
	});
	socket.on("ice", (ice, roomName) => {
		socket.to(roomName).emit("ice", ice);
	});
});

httpServer.listen(process.env.PORT, () => {
	console.log(`✅ Listening on http://localhost:${process.env.PORT}`);
});
