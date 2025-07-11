package handlers

import (
	"fmt"
	"log"
	"net/http"

	"github.com/TTLuke/messenger/utils"
	"github.com/TTLuke/messenger/ws"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

type WSHandler struct {
	Hub *ws.Hub
}

func NewWSHandler(h *ws.Hub) *WSHandler {
	return &WSHandler{
		Hub: h,
	}
}

type CreateRoomReq struct {
	ID       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Password string    `json:"password"`
}

func (h *WSHandler) CreateRoom(c echo.Context) error {
	var req CreateRoomReq
	if err := c.Bind(&req); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	if req.Password == "" {
		h.Hub.Rooms[req.ID] = &ws.Room{
			ID:       req.ID,
			Name:     req.Name,
			Password: "",
			Clients:  make(map[uuid.UUID]*ws.Client),
		}
	} else {
		pass, err := utils.HashPassword(req.Password)
		if err != nil {
			return c.String(http.StatusInternalServerError, err.Error())
		}
		h.Hub.Rooms[req.ID] = &ws.Room{
			ID:       req.ID,
			Name:     req.Name,
			Password: pass,
			Clients:  make(map[uuid.UUID]*ws.Client),
		}
	}

	return c.JSON(http.StatusOK, req)
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type JoinRoomReq struct {
	RoomId       uuid.UUID `query:"room_id"`
	UserId       uuid.UUID `query:"user_id"`
	UserName     string    `query:"user_name"`
	RoomPassword string    `query:"room_password"`
}

func (h *WSHandler) JoinRoom(c echo.Context) error {
	// log.Print("endpoint: join-room, hit")
	var req JoinRoomReq
	if err := c.Bind(&req); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	log.Printf("%v\n", req)

	if h.Hub.Rooms[req.RoomId].Password != "" {
		log.Printf("entered: %v, checked: %v", req.RoomPassword, h.Hub.Rooms[req.RoomId].Password)
		if err := utils.CheckPassword(req.RoomPassword, h.Hub.Rooms[req.RoomId].Password); err != nil {
			return c.String(http.StatusUnauthorized, "wrong room password")
		}
	}

	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	client := &ws.Client{
		Conn:     conn,
		Message:  make(chan *ws.Message, 10),
		ID:       req.UserId,
		RoomID:   req.RoomId,
		Username: req.UserName,
	}
	// register client into room
	h.Hub.Register <- client

	go client.WriteMessage()
	client.ReadMessage(h.Hub)

	return c.NoContent(http.StatusOK)
}

func (h *WSHandler) GetMessages(c echo.Context) error {
	var messages []ws.Message
	roomID, _ := uuid.Parse(c.Param("room-id"))

	if _, ok := h.Hub.Rooms[roomID]; !ok {
		messages = make([]ws.Message, 0)
		return c.JSON(http.StatusOK, messages)
	}
	for _, msg := range h.Hub.Rooms[roomID].Messages {
		messages = append(messages, ws.Message{
			Username: msg.Username,
			Content:  msg.Content,
			RoomID:   msg.RoomID,
		})
	}
	return c.JSON(http.StatusOK, messages)
}

type RoomRes struct {
	ID       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Password string    `json:"password"`
}

func (h *WSHandler) GetRooms(c echo.Context) error {
	rooms := make([]RoomRes, 0)
	for _, room := range h.Hub.Rooms {
		rooms = append(rooms, RoomRes{
			ID:       room.ID,
			Name:     room.Name,
			Password: room.Password,
		})
	}
	return c.JSON(http.StatusOK, rooms)
}

type ClientRes struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
}

func (h *WSHandler) GetClients(c echo.Context) error {
	var clients []ClientRes
	roomID, _ := uuid.Parse(c.Param("room-id"))

	if _, ok := h.Hub.Rooms[roomID]; !ok {
		clients = make([]ClientRes, 0)
		return c.JSON(http.StatusOK, clients)
	}
	for _, client := range h.Hub.Rooms[roomID].Clients {
		clients = append(clients, ClientRes{
			ID:       client.ID,
			Username: client.Username,
		})
	}
	fmt.Printf("%v", clients)
	return c.JSON(http.StatusOK, clients)
}
