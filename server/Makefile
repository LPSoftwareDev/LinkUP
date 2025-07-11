# Makefile
.PHONY: build

BINARY_NAME=messenger

# build builds the tailwind css sheet, and compiles the binary into a usable thing.
build:
	go mod tidy && \
	go generate && \
	go build -ldflags="-w -s" -o ${BINARY_NAME}

clean:
	go clean
