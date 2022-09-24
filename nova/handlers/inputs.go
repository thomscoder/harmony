package handlers

import (
	"fmt"
	"nova/texts"
	ns "nova/virtual"
	"strings"

	"github.com/go-git/go-billy/v5"
)

func Init(ns ns.NovaStore, store billy.Filesystem, filename string, content string) string {
	ns.SetWatcher(store)
	ns.OpenFile(store, filename)
	ns.Save(store, filename, content)
	filenames := ns.GetFiles(store, texts.CurrentDirectory)
	fmt.Println(filenames)
	//ns.GetFileContent(store, filename)
	return strings.Join(filenames, " ")
}

func getInputs() string {
	var repoToClone string
	fmt.Printf("%s%s%s ", texts.CYAN, texts.RepositoryToClone, texts.RESET)
	fmt.Scanf("%s", &repoToClone)
	return repoToClone
}
