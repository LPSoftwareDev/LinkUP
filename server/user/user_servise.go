package user

import (
	"context"
	"time"

	"github.com/TTLuke/messenger/database"
	"github.com/TTLuke/messenger/utils"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
)

const (
	secretKey = "secret"
)

type service struct {
	DB      *database.Database
	timeout time.Duration
}

func NewService(db *database.Database) Service {
	return &service{
		DB:      db,
		timeout: time.Duration(2) * time.Second,
	}
}

func (s *service) CreateUser(c context.Context, req *CreateUserReq) (*CreateUserRes, error) {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	u := database.CreateUserParams{
		ID:        uuid.New(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Username:  req.Username,
		Email:     req.Email,
		Password:  hashedPassword,
	}

	r, err := s.DB.DB.CreateUser(ctx, u)
	if err != nil {
		return nil, err
	}

	res := &CreateUserRes{
		ID:       r.ID,
		Username: r.Username,
		Email:    r.Email,
	}

	return res, nil
}

type JWTClaims struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
	jwt.RegisteredClaims
}

func (s *service) Login(c context.Context, req *LoginUserReq) (*LoginUserRes, error) {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	u, err := s.DB.DB.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return &LoginUserRes{}, err
	}

	err = utils.CheckPassword(req.Password, u.Password)
	if err != nil {
		return &LoginUserRes{}, err
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, JWTClaims{
		ID:       u.ID,
		Username: u.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    u.ID.String(),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	})

	ss, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return &LoginUserRes{}, err
	}

	return &LoginUserRes{AccessToken: ss, Username: u.Username, ID: u.ID}, nil
}
