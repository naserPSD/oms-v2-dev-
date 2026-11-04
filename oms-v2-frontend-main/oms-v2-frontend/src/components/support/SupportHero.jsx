// SupportHero.jsx
export default function SupportHero() {
    return (
        <div className="bg-gradient-to-r from-blue-100 to-gray-100 py-16 text-center">
            <h1 className="text-4xl font-bold">Support Center</h1>
            <p className="mt-3 text-gray-600">
                Find answers to common questions
            </p>

            <div className="mt-6 flex justify-center">
                <div className="flex w-full max-w-xl bg-white rounded-xl shadow">
                    <input
                        className="flex-1 px-4 py-3 outline-none"
                        placeholder="Search..."
                    />
                    <button className="bg-blue-600 text-white px-6 rounded-r-xl">
                        Search
                    </button>
                </div>
            </div>
        </div>
    );
}