package database

import (
	"database/sql"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Database struct {
	DB *Queries
}

func NewDatabase() *Database {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		log.Fatal("DB_URL is not found in the environment")
	}
	conn, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Error - failed to connect to DB")
	}
	log.Print("Database: Connected")

	return &Database{DB: New(conn)}
}
