package ws

import (
	"log"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type Message struct {
	Username string    `json:"username"`
	Content  string    `json:"content"`
	RoomID   uuid.UUID `json:"roomId"`
}

type Client struct {
	Conn     *websocket.Conn
	Message  chan *Message
	ID       uuid.UUID `json:"id"`
	RoomID   uuid.UUID `json:"roomId"`
	Username string    `json:"username"`
}

func (c *Client) WriteMessage() {
	defer func() {
		c.Conn.Close()
	}()
	for {
		message, ok := <-c.Message
		if !ok {
			return
		}
		c.Conn.WriteJSON(message)
	}
}

func (c *Client) ReadMessage(hub *Hub) {
	defer func() {
		hub.Unregister <- c
		c.Conn.Close()
	}()
	for {
		_, data, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		message := &Message{
			Content:  string(data),
			RoomID:   c.RoomID,
			Username: c.Username,
		}
		hub.Broadcast <- message
	}
}
