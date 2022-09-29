package handlers

import (
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

	return strings.Join(filenames, " ")
}
