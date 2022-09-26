package virtual

import (
	"log"
	"nova/texts"

	"github.com/go-git/go-billy/v5"
	"github.com/go-git/go-billy/v5/util"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/storage/memory"
)

type StoreInterface interface {
	SetWatcher(billy.Filesystem) map[string]string
	CreateStore() (billy.Filesystem, *memory.Storage)
	GetFiles(billy.Filesystem, string)
	CreateFiles(billy.Filesystem, string)
	OpenFile(store billy.Filesystem, fileName string)
	Save(store billy.Filesystem, filename string, content string)
	GetFileContent(store billy.Filesystem, fileName string)
}
type NovaStore struct {
	Watcher       map[string]string
	CurrentBranch *plumbing.Reference
}

func (ns *NovaStore) SetWatcher(store billy.Filesystem) map[string]string {
	ns.Watcher = make(map[string]string)
	ns.Watcher = fileLastModification(store)
	return ns.Watcher
}

func (ns *NovaStore) CreateStore() (billy.Filesystem, *memory.Storage) {
	return createVirtualSystem()
}

func (ns *NovaStore) GetFiles(store billy.Filesystem, dir string) []string {
	return listFiles(store, dir)
}

func (ns *NovaStore) OpenFile(store billy.Filesystem, fileName string) billy.File {
	fileGotCreated, file := openFile(store, fileName)
	if fileGotCreated != nil {
		log.Println(texts.FileOpenedSuccessfully, fileName)
		ns.SetWatcher(fileGotCreated)
	}
	return file
}

func (ns *NovaStore) Save(store billy.Filesystem, filename string, content string) {
	util.WriteFile(store, filename, []byte(content), 0644)
}

func (ns *NovaStore) GetFileContent(store billy.Filesystem, fileName string) string {
	return readFileContent(store, fileName)
}
