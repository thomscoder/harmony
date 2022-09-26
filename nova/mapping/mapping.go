package mapping

import (
	"encoding/json"
	"nova/handlers"
	"nova/texts"
	nova "nova/virtual"
	"syscall/js"
)

var novaStore nova.NovaStore = nova.NovaStore{}
var store, storer = novaStore.CreateStore()

type Files struct {
	Files []File `json:"files"`
}

type File struct {
	Name    string `json:"name"`
	Content string `json:"content"`
}

func jsonReader(jsonFile []byte) (string, string) {

	var files Files

	json.Unmarshal(jsonFile, &files)

	return files.Files[0].Name, files.Files[0].Content
}

func OpenVirtualFile() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		filename := args[0].String()

		if len(filename) == 0 {
			return texts.HtmlEmptyStringMsg
		}
		return novaStore.GetFileContent(store, filename)
	})
}

func SaveVirtualFile() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		filename, content := jsonReader([]byte(args[0].String()))

		if len(filename) == 0 {
			return texts.HtmlEmptyStringMsg
		}
		novaStore.Save(store, filename, content)

		return "Saved"
	})
}

func InitProject() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		filename, content := jsonReader([]byte(args[0].String()))

		if len(filename) == 0 {
			return texts.HtmlEmptyStringMsg
		}
		return handlers.Init(novaStore, store, filename, content)
	})
}
