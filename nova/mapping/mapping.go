package mapping

import (
	"encoding/json"
	"fmt"
	"nova/handlers"
	"nova/texts"
	nova "nova/virtual"
	"strings"
	"syscall/js"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
)

var novaStore nova.NovaStore = nova.NovaStore{}
var store, storer = novaStore.CreateStore()

var repository, err = git.Open(storer, store)

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
		status, err := wt.Status()
		if status.String() == "" {
			return ""
		}
		commit := make(map[string]string)

		commitMsg := args[0].String()

		if err != nil {
			fmt.Println(err.Error())
			return err.Error()
		}
		hash := novaStore.Screenshot(store, wt, commitMsg)
		if hash != "" {
			commit["hash"] = hash
			commit["message"] = commitMsg
			commitsToJson, _ := json.Marshal(commit)
			fmt.Println(commit)
			return string(commitsToJson)
		}
		return "err"

	})
}

func CreateVirtualFiles() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		filename, content := jsonReader([]byte(args[0].String()))

		novaStore.SetBranch(repository)
		if len(filename) == 0 {
			return texts.HtmlEmptyStringMsg
		}
		return handlers.Init(novaStore, store, filename, content)
	})
}

func GetVirtualFiles() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		filenames := novaStore.GetFiles(store, texts.CurrentDirectory)

		return strings.Join(filenames, " ")
	})
}

func GoToBranch() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		var branches []string

		branchName := args[0].String()
		novaStore.SetBranch(repository)
		_err := novaStore.GotoBranch(repository, branchName)

		if _err != nil {
			return _err
		}

		_branches, branchesErr := repository.Branches()
		if branchesErr != nil {
			return branchesErr
		}
		_branches.ForEach(func(branch *plumbing.Reference) error {
			branches = append(branches, branch.Name().Short())
			return nil
		})
		return strings.Join(branches, " ")
	})
}
