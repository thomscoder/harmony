package mapping

import (
	"fmt"
	"nova/handlers"
	"nova/texts"
	nova "nova/virtual"
	"syscall/js"
)

func InitProject() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		fmt.Println(args[0])
		fmt.Println("fuck")
		filename := args[0].String()
		if len(filename) == 0 {
			return texts.HtmlEmptyStringMsg
		}
		novaStore := nova.NovaStore{}
		handlers.Init(novaStore, filename)

		return "Created file: " + filename
	})
}
