package mapping

import (
	"encoding/json"
	"fmt"
	"nova/handlers"
	"nova/texts"
	nova "nova/virtual"
	"syscall/js"

	"github.com/go-git/go-git/v5"
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

func VirtualCommit() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		repository, err := git.Open(storer, store)
		wt, _ := repository.Worktree()

		commitMsg := args[0].String()

		if err != nil {
			fmt.Println(err.Error())
			return err.Error()
		}
		return novaStore.Screenshot(store, wt, commitMsg)
	})
}

func InitProject() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		filename, content := jsonReader([]byte(args[0].String()))
		fmt.Println(novaStore.GetFiles(store, texts.CurrentDirectory))
		repository, _ := git.Open(storer, store)
		novaStore.SetBranch(repository)
		if len(filename) == 0 {
			return texts.HtmlEmptyStringMsg
		}
		return handlers.Init(novaStore, store, filename, content)
	})
}
