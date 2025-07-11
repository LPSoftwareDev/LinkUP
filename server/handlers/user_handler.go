package handlers

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/TTLuke/messenger/user"
	"github.com/labstack/echo/v4"
)

type UserHandler struct {
	Service user.Service
}

func NewUserHandler(s user.Service) *UserHandler {
	return &UserHandler{
		Service: s,
	}
}

func (h *UserHandler) CreateUser(c echo.Context) error {
	var u user.CreateUserReq
	if err := c.Bind(&u); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	res, err := h.Service.CreateUser(c.Request().Context(), &u)
	if err != nil {
		log.Print(err)
		return c.JSON(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, res)
}

func (h *UserHandler) Login(c echo.Context) error {
	var usr user.LoginUserReq
	if err := c.Bind(&usr); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	fmt.Printf("%v", usr)

	u, err := h.Service.Login(c.Request().Context(), &usr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	cookie := &http.Cookie{
		Name:     "jwt",
		Value:    u.AccessToken,
		Expires:  time.Now().Add(24 * time.Hour),
		Path:     "/",
		Domain:   "localhost",
		Secure:   false,
		HttpOnly: true,
	}
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, u)
}

func (h *UserHandler) LogOut(c echo.Context) error {

	cookie := &http.Cookie{
		Name:     "jwt",
		Value:    "",
		MaxAge:   -1,
		HttpOnly: true,
	}
	c.SetCookie(cookie)
	return c.JSON(http.StatusOK, map[string]string{
		"message": "logout successful",
	})
}
