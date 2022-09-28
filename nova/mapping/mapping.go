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

var repository, err = git.Open(storer, store)

func branchSetter(repo *git.Repository) error {
	novaStore.SetBranch(repo)
	return nil

}

var branchSetted = branchSetter(repository)

var commitsHistory = make(map[string]string)

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

func GetCurrentBranch() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return novaStore.CurrentBranch.Name().Short()
	})
}

func VirtualCommit() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		wt, _ := repository.Worktree()

		commitMsg := args[0].String()

		if err != nil {
			fmt.Println(err.Error())
			return err.Error()
		}
		hash := novaStore.Screenshot(store, wt, commitMsg)
		if hash != "" {
			commitsHistory[commitMsg] = hash
		}

		commitsToJson, _ := json.Marshal(commitsHistory)
		return string(commitsToJson)
	})
}

func InitProject() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		filename, content := jsonReader([]byte(args[0].String()))
		fmt.Println(novaStore.GetFiles(store, texts.CurrentDirectory))
		novaStore.SetBranch(repository)
		if len(filename) == 0 {
			return texts.HtmlEmptyStringMsg
		}
		return handlers.Init(novaStore, store, filename, content)
	})
}
