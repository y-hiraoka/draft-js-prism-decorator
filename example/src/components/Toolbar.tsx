import { EditorState, RichUtils } from "draft-js";
import "./Toolbar.css";

type Props = {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
};

export const Toolbar: React.VFC<Props> = ({ editorState, setEditorState }) => {
  const onMouseDown = (e: React.MouseEvent) => e.preventDefault();

  const toggleBlockType = (blockType: string) => {
    setEditorState(prevState => RichUtils.toggleBlockType(prevState, blockType));
  };

  const toggleInlineStyle = (styleType: string) => {
    setEditorState(prevState => RichUtils.toggleInlineStyle(prevState, styleType));
  };

  const selection = editorState.getSelection();
  const contentState = editorState.getCurrentContent();
  const contentBlock = contentState.getBlockForKey(selection.getStartKey());
  const currentInlineStyle = editorState.getCurrentInlineStyle();

  return (
    <div className="Toolbar">
      <div className="Toolbar__row">
        <div className="Toolbar__row-inner">
          {BLOCK_TYPES.map(block => (
            <button
              key={block.blockType}
              className="Toolbar__button"
              onMouseDown={onMouseDown}
              onClick={() => toggleBlockType(block.blockType)}
              data-is-active={block.blockType === contentBlock.getType()}>
              {block.displayName}
            </button>
          ))}
        </div>
      </div>
      <div className="Toolbar__row">
        <div className="Toolbar__row-inner">
          {INLINE_STYLE_TYPES.map(style => (
            <button
              key={style.styleType}
              className="Toolbar__button"
              onMouseDown={onMouseDown}
              onClick={() => toggleInlineStyle(style.styleType)}
              data-is-active={currentInlineStyle.has(style.styleType)}>
              {style.displayName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const BLOCK_TYPES = [
  {
    displayName: "JS / TS Code",
    blockType: "code-block",
  },
  {
    displayName: "H1",
    blockType: "header-one",
  },
  {
    displayName: "H2",
    blockType: "header-two",
  },
  {
    displayName: "H3",
    blockType: "header-three",
  },
  {
    displayName: "H4",
    blockType: "header-four",
  },
  {
    displayName: "H5",
    blockType: "header-five",
  },
  {
    displayName: "H6",
    blockType: "header-six",
  },
  {
    displayName: "UL",
    blockType: "unordered-list-item",
  },
  {
    displayName: "OL",
    blockType: "ordered-list-item",
  },
  {
    displayName: "Quote",
    blockType: "blockquote",
  },
];

const INLINE_STYLE_TYPES = [
  {
    displayName: "bold",
    styleType: "BOLD",
  },
  {
    displayName: "italic",
    styleType: "ITALIC",
  },
  {
    displayName: "underline",
    styleType: "UNDERLINE",
  },
  {
    displayName: "strikethrough",
    styleType: "STRIKETHROUGH",
  },
  {
    displayName: "code",
    styleType: "CODE",
  },
];
