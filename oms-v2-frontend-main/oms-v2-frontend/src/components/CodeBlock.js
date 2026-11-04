export function CodeBlock({ language, children }) {
    return (
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <code className={`language-${language}`}>{children}</code>
        </pre>
    );
  }