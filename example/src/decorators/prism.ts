import { ContentBlock } from "draft-js";
import createPrismDecorator from "draft-js-prism-decorator";

import "prismjs/themes/prism.css";
import "prismjs/components/prism-typescript";

const getLanguage = (block: ContentBlock) => "typescript";

export const prismDecorator = createPrismDecorator({ getLanguage });
