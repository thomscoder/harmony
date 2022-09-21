package editor

import (
	"bytes"
	"fmt"
	"io"
	"nova/editor/variables"
	"os"
	"strings"
	"unicode"

	"github.com/mattn/go-runewidth"
	"golang.org/x/sys/unix"
)

func enableRawMode() (*unix.Termios, error) {
	term, err := unix.IoctlGetTermios(variables.Stdinfd, variables.ReadTermios)
	if err != nil {
		return nil, err
	}
	raw := *term
	raw.Iflag &^= unix.BRKINT | unix.INPCK | unix.ISTRIP | unix.IXON

	raw.Cflag |= unix.CS8
	raw.Lflag &^= unix.ECHO | unix.ICANON | unix.ISIG | unix.IEXTEN
	raw.Cc[unix.VMIN] = 0
	raw.Cc[unix.VTIME] = 1
	if err := unix.IoctlSetTermios(variables.Stdinfd, variables.WriteTermios, &raw); err != nil {
		return nil, err
	}
	return term, nil
}
func readKey() (variables.Key, error) {
	buf := make([]byte, 4)
	for {
		n, err := os.Stdin.Read(buf)
		if err != nil && err != io.EOF {
			return 0, err
		}
		if n > 0 {
			buf = bytes.TrimRightFunc(buf, func(r rune) bool { return r == 0 })
			switch {
			case bytes.Equal(buf, []byte("\x1b[A")):
				return variables.ArrowUp, nil
			case bytes.Equal(buf, []byte("\x1b[B")):
				return variables.ArrowDown, nil
			case bytes.Equal(buf, []byte("\x1b[C")):
				return variables.ArrowRight, nil
			case bytes.Equal(buf, []byte("\x1b[D")):
				return variables.ArrowLeft, nil
			case bytes.Equal(buf, []byte("\x1b[1~")), bytes.Equal(buf, []byte("\x1b[7~")),
				bytes.Equal(buf, []byte("\x1b[H")), bytes.Equal(buf, []byte("\x1bOH")):
				return variables.Home, nil
			case bytes.Equal(buf, []byte("\x1b[4~")), bytes.Equal(buf, []byte("\x1b[8~")),
				bytes.Equal(buf, []byte("\x1b[F")), bytes.Equal(buf, []byte("\x1bOF")):
				return variables.End, nil
			case bytes.Equal(buf, []byte("\x1b[3~")):
				return variables.Delete, nil
			case bytes.Equal(buf, []byte("\x1b[5~")):
				return variables.PageUp, nil
			case bytes.Equal(buf, []byte("\x1b[6~")):
				return variables.PageDown, nil

			default:
				return variables.Key(buf[0]), nil
			}
		}
	}
}

func rowCxToRx(row *Row, cx int) int {
	rx := 0
	for _, r := range row.chars[:cx] {
		if r == '\t' {
			rx += (variables.Tabs) - (rx % variables.Tabs)
		} else {
			rx += runewidth.RuneWidth(r)
		}
	}
	return rx
}

func rowRxToCx(row *Row, rx int) int {
	curRx := 0
	for i, r := range row.chars {
		if r == '\t' {
			curRx += (variables.Tabs) - (curRx % variables.Tabs)
		} else {
			curRx += runewidth.RuneWidth(r)
		}

		if curRx > rx {
			return i
		}
	}
	panic("unreachable")
}
func getCursorPosition() (row, col int, err error) {
	if _, err = os.Stdout.Write([]byte("\x1b[6n")); err != nil {
		return
	}
	if _, err = fmt.Fscanf(os.Stdin, "\x1b[%d;%d", &row, &col); err != nil {
		return
	}
	return
}
func isArrowKey(k variables.Key) bool {
	return k == variables.ArrowUp || k == variables.ArrowRight ||
		k == variables.ArrowDown || k == variables.ArrowLeft
}
func isSeparator(r rune) bool {
	return unicode.IsSpace(r) || strings.IndexRune(",.()+-/*=~%<>[]{}:;", r) != -1
}

func syntaxToColor(h uint8) int {
	switch h {
	case variables.HlComment, variables.HlMlComment:
		return 90
	case variables.HlKeyword1:
		return 31
	case variables.HlKeyword2:
		return 96
	case variables.HlString:
		return 36
	case variables.HlNumber:
		return 33
	case variables.HlMatch:
		return 32
	default:
		return 37
	}
}

func die(err error) {
	os.Stdout.WriteString("\x1b[2J")
	os.Stdout.WriteString("\x1b[H")
	fmt.Fprintf(os.Stderr, "error: %v\n", err)
	os.Exit(1)
}
