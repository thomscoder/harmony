package virtual

import (
	"fmt"
	"log"
	"nova/texts"

	"github.com/go-git/go-billy/v5"
	"github.com/go-git/go-billy/v5/util"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/go-git/go-git/v5/storage/memory"
)

type StoreInterface interface {
	SetWatcher(store billy.Filesystem) map[string]string
	CreateStore() (billy.Filesystem, *memory.Storage)
	GetFiles(store billy.Filesystem, dir string) []string
	OpenFile(store billy.Filesystem, fileName string) billy.File
	Save(store billy.Filesystem, filename string, content string)
	GetFileContent(store billy.Filesystem, fileName string) string
	SetBranch(repo *git.Repository)
	Screenshot(store billy.Filesystem, wt *git.Worktree, msg string) string
	GotoBranch(repo *git.Repository, branchName string) error
	GoToCommit(repo *git.Repository, commitHash string) error
	IsDirectory(store billy.Filesystem, dir string, filename string) bool
	ExploreDirectory(store billy.Filesystem, dir string, filename string) []string
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

func (ns *NovaStore) ExploreDirectory(store billy.Filesystem, dir string, filename string) []string {
	return getDirectoryFiles(store, dir, filename)
}

func (ns *NovaStore) IsDirectory(store billy.Filesystem, dir string, filename string) bool {
	return isDirectory(store, dir, filename)
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

func (ns *NovaStore) SetBranch(repo *git.Repository) {
	currentBranch, err := repo.Head()
	if err != nil {
		log.Fatal(err)
	}
	ns.CurrentBranch = currentBranch
}

func (ns *NovaStore) Screenshot(store billy.Filesystem, wt *git.Worktree, msg string) string {
	files, _ := store.ReadDir(texts.CurrentDirectory)

	for _, file := range files {
		wt.Add(file.Name())
	}

	hash, err := wt.Commit(msg, &git.CommitOptions{
		Author: &object.Signature{
			Name:  "Nova Harmony",
			Email: "nova@harmony.com",
		},
	})

	if err != nil {
		fmt.Println(err.Error())
		return "Couldn't commit"
	}
	return hash.String()
}

func (ns *NovaStore) GotoBranch(repo *git.Repository, branchName string) error {
	err := createBranch(repo, branchName)
	if err != nil {
		return err
	}
	ns.SetBranch(repo)
	return nil
}

func (ns *NovaStore) GoToCommit(repo *git.Repository, commitHash string) error {
	err := checkoutToCommit(repo, commitHash)
	if err != nil {
		return err
	}

	return nil
}
