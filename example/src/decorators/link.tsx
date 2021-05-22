import { ContentBlock, DraftDecorator } from "draft-js";

function findWithRegex(
  regex: RegExp,
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
) {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}

const urlRegex =
  /https?:\/\/[-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+/g;

type Props = { decoratedText: string };
const LinkDecoratorComponent: React.FC<Props> = ({ children, decoratedText }) => {
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(decoratedText, "_blank");
  };
  return (
    <a style={{ cursor: "pointer" }} onClick={onClick} href={decoratedText}>
      {children}
    </a>
  );
};

export const linkDecorator: DraftDecorator = {
  strategy: (block, callback) => findWithRegex(urlRegex, block, callback),
  component: LinkDecoratorComponent,
};
