package user

import (
	"context"

	"github.com/google/uuid"
)

type CreateUserReq struct {
	Username string `json:"username" db:"username"`
	Email    string `json:"email" db:"email"`
	Password string `json:"password" db:"password"`
}

type CreateUserRes struct {
	ID       uuid.UUID `json:"id" db:"id"`
	Username string    `json:"username" db:"username"`
	Email    string    `json:"email" db:"email"`
}

type LoginUserReq struct {
	Email    string `json:"email" db:"email"`
	Password string `json:"password" db:"email"`
}

type LoginUserRes struct {
	AccessToken string    `json:"-"`
	ID          uuid.UUID `json:"id" db:"id"`
	Username    string    `json:"username" db:"username"`
}

type Service interface {
	CreateUser(c context.Context, req *CreateUserReq) (*CreateUserRes, error)
	Login(c context.Context, req *LoginUserReq) (*LoginUserRes, error)
}
