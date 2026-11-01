
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface FormattedAnswerProps {
  content: string;
}

export default function FormattedAnswer({
  content,
}: FormattedAnswerProps) {
  return (
    <div className="formatted-answer">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
