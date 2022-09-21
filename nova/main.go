package main

import (
	"nova/handlers"
	nova "nova/virtual"
	"syscall/js"
)

func main() {
	js.Global()
	novaStore := nova.NovaStore{}
	handlers.Init(novaStore)
}
