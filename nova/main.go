package main

import (
	"nova/mapping"
	"syscall/js"
)

func main() {
	ch := make(chan struct{}, 0)
	js.Global().Set("createVirtualFiles", mapping.CreateVirtualFiles())
	js.Global().Set("openVirtualFile", mapping.OpenVirtualFile())
	js.Global().Set("saveVirtualFile", mapping.SaveVirtualFile())
	js.Global().Set("virtualCommit", mapping.VirtualCommit())
	js.Global().Set("getCurrentBranch", mapping.GetCurrentBranch())
	js.Global().Set("getVirtualFiles", mapping.GetVirtualFiles())
	js.Global().Set("goToBranch", mapping.GoToBranch())
	<-ch
}
