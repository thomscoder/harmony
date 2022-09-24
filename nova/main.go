package main

import (
	"nova/mapping"
	"syscall/js"
)

func main() {
	ch := make(chan struct{}, 0)
	js.Global().Set("initProject", mapping.InitProject())
	js.Global().Set("openVirtualFile", mapping.OpenVirtualFile())
	js.Global().Set("saveVirtualFile", mapping.SaveVirtualFile())
	<-ch
}
