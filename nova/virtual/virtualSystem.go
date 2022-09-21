package virtual

import (
	"fmt"
	"log"
	"nova/texts"

	"github.com/go-git/go-billy/v5"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/go-git/go-git/v5/plumbing/storer"
	"github.com/go-git/go-git/v5/storage/memory"
)

type StoreInterface interface {
	SetWatcher(billy.Filesystem) map[string]string
	CreateStore(string)
	Screenshot(billy.Filesystem, *git.Worktree)
	GetFiles(billy.Filesystem, string)
	CreateFiles(billy.Filesystem, string)
	SetBranch(*git.Repository)
	GetStatus(*git.Worktree) git.Status
	GetLogs(*git.Repository)
	GetBranches(*git.Repository) (storer.ReferenceIter, error)
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

func (ns *NovaStore) CreateStore(url string) (billy.Filesystem, *memory.Storage) {
	return createVirtualSystem(url)
}

func (ns *NovaStore) GetFiles(store billy.Filesystem, dir string) {
	listFiles(store, dir)
}

func (ns *NovaStore) OpenFile(store billy.Filesystem, fileName string) {
	fileGotCreated := openFile(store, fileName)
	if fileGotCreated != nil {
		log.Println(texts.FileOpenedSuccessfully, fileName)
		ns.SetWatcher(fileGotCreated)
	}
}

func (ns *NovaStore) GetBranches(repo *git.Repository) (storer.ReferenceIter, error) {
	branches, err := repo.Branches()
	if err != nil {
		return nil, err
	}
	return branches, nil
}

func (ns *NovaStore) GetFileContent(store billy.Filesystem, fileName string) {
	readFileContent(store, fileName)
}

func (ns *NovaStore) Screenshot(store billy.Filesystem, wt *git.Worktree) error {
	files, _ := store.ReadDir(texts.CurrentDirectory)
	for _, file := range files {
		wt.Add(file.Name())
	}
	status, _ := wt.Status()
	msg := status.String()
	hash, err := wt.Commit(msg, &git.CommitOptions{})
	if err != nil {
		return err
	}
	log.Printf(fmt.Sprintf(texts.CommittedSuccessfully, hash, msg))
	return nil
}

func (ns *NovaStore) SetBranch(repo *git.Repository) {
	currentBranch, err := repo.Head()
	if err != nil {
		log.Fatal(err)
	}
	ns.CurrentBranch = currentBranch
}

func (ns *NovaStore) GetStatus(wt *git.Worktree) git.Status {
	status, err := wt.Status()
	if err != nil {
		return nil
	}
	return status
}

func (ns *NovaStore) GetLogs(repo *git.Repository) object.CommitIter {
	logs, err := repo.Log(&git.LogOptions{
		All:   true,
		Order: git.LogOrderCommitterTime,
	})
	if err != nil {
		return nil
	}
	return logs
}

func (ns *NovaStore) GotoBranch(repo *git.Repository, branchName string) error {
	err := createBranch(repo, branchName)
	if err != nil {
		return err
	}
	ns.SetBranch(repo)
	return nil
}
