export function Preview({ title, description, children }) {
    return (
        <div className="border rounded-lg p-6 space-y-4">
            <div>
                <h3 className="text-xl font-medium">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{description}</p>
            </div>
            <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800">
                {children}
            </div>
        </div>
    );
  }