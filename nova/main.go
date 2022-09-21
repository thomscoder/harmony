package main

import (
	"nova/texts"
	"syscall/js"
)

func InitProject() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		str := args[0].String()
		if len(str) == 0 {
			return texts.HtmlEmptyStringMsg
		}
		return str
	})
}

func main() {
	ch := make(chan struct{}, 0)
	js.Global().Set("initProject", InitProject())
	<-ch
}
