package main

import (
	"errors"
	"fmt"
	"log"
	"net"
	"net/http"

	"github.com/TTLuke/messenger/database"
	"github.com/TTLuke/messenger/handlers"
	"github.com/TTLuke/messenger/user"
	"github.com/TTLuke/messenger/ws"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "github.com/lib/pq"
)

func getLocalIP() (string, error) {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return "", err
	}
	for _, addr := range addrs {
		if ipnet, ok := addr.(*net.IPNet); ok && !ipnet.IP.IsLoopback() && ipnet.IP.To4() != nil {
			return ipnet.IP.String(), nil
		}
	}
	return "", errors.New("no valid IP found")
}

func main() {

	ip, err := getLocalIP()
	if err != nil {
		log.Fatal(err)
	}
	origin := fmt.Sprintf("http://%s:3000", ip)
	fmt.Printf(origin)

	db := database.NewDatabase()
	userSvc := user.NewService(db)
	userHandler := handlers.NewUserHandler(userSvc)

	hub := ws.NewHub()
	wsHandler := handlers.NewWSHandler(hub)
	go hub.Run()

	app := echo.New()
	app.Static("/static", "static")
	app.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://*:3000"},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
		AllowCredentials: true,
	}))

	app.GET("/ws/join-room/", wsHandler.JoinRoom)
	app.GET("/ws/get-rooms", wsHandler.GetRooms)
	app.GET("/ws/get-clients/:room-id", wsHandler.GetClients)
	app.GET("/ws/get-messages/:room-id", wsHandler.GetMessages)

	app.POST("/register", userHandler.CreateUser)
	app.POST("/login", userHandler.Login)
	app.POST("/logout", userHandler.LogOut)
	app.POST("/ws/create-room", wsHandler.CreateRoom)

	app.Start(":8080")
}
