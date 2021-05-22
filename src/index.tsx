import React from "react";
import { ContentBlock, ContentState, DraftDecorator } from "draft-js";
import Prism from "prismjs";

type Options = {
  /**
   * A function that filters blocks.
   * By default, it is determined by whether `block.getType()` is "code-block" or not.
   */
  filter?: (block: ContentBlock) => boolean;
  /**
   * A function that gets language string.
   * If it is not passed, `block.getData().get("language")` will be used.
   */
  getLanguage?: (block: ContentBlock) => string;
};

const defaultFilter = (block: ContentBlock) => block.getType() === "code-block";
const defaultGetLanguage = (block: ContentBlock) => {
  const language = block.getData().get("language");

  if (typeof language !== "string") {
    throw new Error('block.getData().get("language") is not string.');
  }

  return language;
};

/**
 * A function to create a DraftDecorator.
 *
 * usage:
 * ```tsx
 * import { EditorState, CompositeDecorator } from "draft-js";
 * import createPrismDecorator from "draft-js-prism-decorator";
 *
 * const decorators = new CompositeDecorator([createPrismDecorator()]);
 * const editorState = EditorState.createEmpty(decorators);
 * ```
 */
export default function createPrismDecorator({
  filter = defaultFilter,
  getLanguage = defaultGetLanguage,
}: Options = {}): DraftDecorator {
  const strategy = createStrategy(filter, getLanguage);

  const component = createTokenComponent(getLanguage);

  return {
    strategy,
    component,
  };
}

type Filter = Required<Options>["filter"];
type GetLanguage = Required<Options>["getLanguage"];

const createStrategy =
  (filter: Filter, getLanguage: GetLanguage): DraftDecorator["strategy"] =>
  (contentBlock, callback) => {
    if (!filter(contentBlock)) return;

    const blockText = contentBlock.getText();
    const language = getLanguage(contentBlock);
    const tokenList = Prism.tokenize(blockText, Prism.languages[language]);

    let start = 0;
    let end = 0;
    for (const token of tokenList) {
      end = end + token.length;

      if (typeof token !== "string") {
        callback(start, end);
      }

      start = end;
    }
  };

const createTokenComponent =
  (getLanguage: GetLanguage): React.FC<DraftDecoratorComponentProps> =>
  props => {
    const contentBlock = props.contentState.getBlockForKey(props.blockKey);
    const blockText = contentBlock.getText();
    const language = getLanguage(contentBlock);
    const tokenList = Prism.tokenize(blockText, Prism.languages[language]);

    let start = 0;
    let end = 0;
    let tokenType: string = "";

    for (const token of tokenList) {
      end = end + token.length;

      if (typeof token !== "string") {
        if (start === props.start && end === props.end) {
          tokenType = token.type;
          break;
        }
      }

      start = end;
    }

    return (
      <span className={`token ${tokenType}`} data-offset-key={props.offsetKey}>
        {props.children}
      </span>
    );
  };

// https://github.com/facebook/draft-js/blob/7f86bca283c7d4c4afe9046016f74dc8e419b505/src/model/decorators/DraftDecorator.js#L54
type DraftDecoratorComponentProps = {
  blockKey: string;
  contentState: ContentState;
  end: number;
  offsetKey: string;
  start: number;
};
