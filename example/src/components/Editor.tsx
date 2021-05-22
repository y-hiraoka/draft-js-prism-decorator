import "draft-js/dist/Draft.css";
import "./Editor.css";

import { useCallback } from "react";
import {
  ContentBlock,
  DraftHandleValue,
  DraftStyleMap,
  Editor as DraftEditor,
  EditorState,
  getDefaultKeyBinding,
  KeyBindingUtil,
  RichUtils,
} from "draft-js";

type Props = {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
};
export const Editor: React.VFC<Props> = ({ editorState, setEditorState }) => {
  const handleKeyCommand = useCallback(
    (command: string, editorState: EditorState): DraftHandleValue => {
      const newState = RichUtils.handleKeyCommand(editorState, command);

      if (newState !== null) {
        setEditorState(newState);
        return "handled";
      }

      return "not-handled";
    },
    [setEditorState],
  );

  const handleReturn = useCallback(
    (event: React.KeyboardEvent<{}>, editorState: EditorState): DraftHandleValue => {
      if (KeyBindingUtil.isSoftNewlineEvent(event)) {
        setEditorState(RichUtils.insertSoftNewline(editorState));
        return "handled";
      }

      return "not-handled";
    },
    [setEditorState],
  );

  const blockStyleFn = useCallback((block: ContentBlock) => {
    const blockType = block.getType();

    if (blockType === "unstyled") {
      return "Editor__unstyled";
    }

    if (blockType === "unordered-list-item" || blockType === "ordered-list-item") {
      return "Editor__list-item";
    }

    if (blockType === "blockquote") {
      return "Editor__blockquote";
    }

    if (blockType === "code-block") {
      return "language-typescript";
    }

    return "";
  }, []);

  const keyBindingFn = useCallback(
    (e: React.KeyboardEvent<{}>) => {
      if (e.code === "Tab") {
        setEditorState(RichUtils.onTab(e, editorState, 5));
      }

      return getDefaultKeyBinding(e);
    },
    [editorState, setEditorState],
  );

  const customStyleMap: DraftStyleMap = {
    CODE: {
      fontSize: "0.9em",
      fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
      overflowWrap: "break-word",
      backgroundColor: "#f5f2f0",
      padding: "2px 6px",
      borderRadius: "2px",
      textShadow: "0 1px white",
    },
  };

  return (
    <DraftEditor
      editorState={editorState}
      onChange={setEditorState}
      handleKeyCommand={handleKeyCommand}
      handleReturn={handleReturn}
      blockStyleFn={blockStyleFn}
      keyBindingFn={keyBindingFn}
      customStyleMap={customStyleMap}
    />
  );
};
