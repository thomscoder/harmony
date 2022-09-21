package main

import (
	"nova/handlers"
	nova "nova/virtual"
)

func main() {
	novaStore := nova.NovaStore{}
	handlers.Init(novaStore)
}
