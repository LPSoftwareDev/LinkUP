package ws

import (
	"fmt"

	"github.com/google/uuid"
)

type Room struct {
	ID       uuid.UUID             `json:"id"`
	Name     string                `json:"name"`
	Password string                `json:"password"`
	Clients  map[uuid.UUID]*Client `json:"clients"`
	Messages []*Message            `json:"messages"`
}

type Hub struct {
	Rooms      map[uuid.UUID]*Room
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan *Message
}

func NewHub() *Hub {
	return &Hub{
		Rooms:      make(map[uuid.UUID]*Room),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan *Message, 5),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			if _, ok := h.Rooms[client.RoomID]; ok {
				room := h.Rooms[client.RoomID]
				if _, ok := room.Clients[client.ID]; !ok {
					room.Clients[client.ID] = client
				}
			}
		case client := <-h.Unregister:
			if _, ok := h.Rooms[client.RoomID]; ok {
				if _, ok := h.Rooms[client.RoomID].Clients[client.ID]; ok {
					delete(h.Rooms[client.RoomID].Clients, client.ID)
					close(client.Message)
				}
			}
		case message := <-h.Broadcast:
			fmt.Printf("HUB: A hub has received a message: %v\n", message)
			if _, ok := h.Rooms[message.RoomID]; ok {
				h.Rooms[message.RoomID].Messages = append(h.Rooms[message.RoomID].Messages, message)
				fmt.Printf("HUB: Messages writen: %v, to room: %v\n", message.Content, message.RoomID)
				for _, client := range h.Rooms[message.RoomID].Clients {
					fmt.Printf("HUB: Writing to client: %v\n", client.Username)
					client.Message <- message

				}
			}
		}
	}
}
