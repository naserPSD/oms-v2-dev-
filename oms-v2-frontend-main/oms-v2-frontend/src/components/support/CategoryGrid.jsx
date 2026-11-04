// CategoryGrid.jsx
export default function CategoryGrid({ categories }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {categories.map((c, i) => (
                <div
                    key={i}
                    className="bg-white p-4 rounded-xl text-center shadow hover:shadow-md cursor-pointer"
                >
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="text-sm text-gray-400">{c.count} articles</p>
                </div>
            ))}
        </div>
    );
}