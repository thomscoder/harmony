package variables

import (
	"errors"
	"fmt"
	"nova/texts"
	"os"
	"runtime"
)

type Key int32

const (
	Enter     Key = 10
	Backspace Key = 127
	ArrowLeft Key = iota + 1000
	ArrowRight
	ArrowUp
	ArrowDown
	Delete
	PageUp
	PageDown
	Home
	End
)

const (
	HlNormal uint8 = iota
	HlComment
	HlMlComment
	HlKeyword1
	HlKeyword2
	HlString
	HlNumber
	HlMatch
)

const (
	HL_HIGHLIGHT_NUMBERS = 1 << iota
	HL_HIGHLIGHT_STRINGS
)

var (
	Stdinfd                   = int(os.Stdin.Fd())
	ErrPromptCanceled         = fmt.Errorf(texts.UserCanceledInputPrompt)
	Stdoutfd                  = int(os.Stdout.Fd())
	ErrQuitEditor             = errors.New(texts.QuitEditor)
	Tabs                      = 4
	ReadTermios, WriteTermios = getOs()
)

func getOs() (uint, uint) {
	var readTermios uint
	var writeTermios uint
	os := runtime.GOOS

	switch os {
	case "linux":
		writeTermios = 0x5402
		readTermios = 0x5401
		return readTermios, writeTermios
	case "darwin":
		writeTermios = 0x80487414
		readTermios = 0x40487413
		return readTermios, writeTermios
	}
	return readTermios, writeTermios
}
